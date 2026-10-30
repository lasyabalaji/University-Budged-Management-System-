from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import mysql.connector

from app.db import get_connection
from app.schemas.finance import (
    TaxFilingCreate, TaxFilingUpdate,
    UtilityBillCreate, UtilityBillUpdate,
    MiscPaymentCreate,
)

router = APIRouter()

#  helper 

def _exec(conn, cursor, sql, params=()):
    cursor.execute(sql, params)
    conn.commit()


# Tuition Revenue 

@router.get("/tuition-revenue")
def list_tuition_revenue(
    semester: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    status:   Optional[str] = Query(None),
):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql    = """
            SELECT tf.fee_id, tf.student_id,
                   s.first_name, s.last_name,
                   tf.semester_name, tf.year,
                   tf.total_credit_hours, tf.total_amount,
                   tf.due_date, tf.payment_date, tf.payment_method, tf.payment_status
            FROM   tuition_fee tf
            JOIN   student s ON tf.student_id = s.student_id
            WHERE  1=1
        """
        params = []
        if semester:
            sql += " AND tf.semester_name = %s"; params.append(semester)
        if year:
            sql += " AND tf.year = %s"; params.append(year)
        if status:
            sql += " AND tf.payment_status = %s"; params.append(status)
        sql += " ORDER BY tf.year DESC, tf.semester_name, s.last_name"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


#  Spending Summary 

@router.get("/spending")
def spending_summary(year: Optional[int] = Query(None)):
    """Aggregate total spending broken down by category, optionally filtered by year."""
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)

        sp_year  = "AND year = %s" if year else ""
        pr_year  = "AND YEAR(period_start) = %s" if year else ""
        ub_year  = "AND billing_year = %s" if year else ""
        mp_year  = "AND YEAR(payment_date) = %s" if year else ""
        cl_year  = "AND LEFT(academic_year, 4) = %s" if year else ""
        sch_year = "AND YEAR(award_date) = %s" if year else ""
        tax_year = "AND fiscal_year = %s" if year else ""

        params = [year, year, year, year, str(year), year, year] if year else []

        cursor.execute(f"""
            SELECT 'Staff Payroll' AS category,
                   COALESCE(SUM(gross_pay), 0) AS total
            FROM staff_payment WHERE payment_status = 'paid' {sp_year}
            UNION ALL
            SELECT 'Student Payroll', COALESCE(SUM(gross_pay), 0)
            FROM payroll WHERE payment_status = 'paid' {pr_year}
            UNION ALL
            SELECT 'Utility Bills', COALESCE(SUM(amount), 0)
            FROM utility_bill WHERE payment_status = 'paid' {ub_year}
            UNION ALL
            SELECT 'Misc Payments', COALESCE(SUM(amount), 0)
            FROM misc_payment WHERE payment_status = 'paid' {mp_year}
            UNION ALL
            SELECT 'Club Funding', COALESCE(SUM(spent_amount), 0)
            FROM club WHERE approval_status = 'approved' {cl_year}
            UNION ALL
            SELECT 'Scholarships', COALESCE(SUM(fixed_award), 0)
            FROM student_scholarship
            WHERE status = 'approved' AND fixed_award IS NOT NULL {sch_year}
            UNION ALL
            SELECT 'Tax Liability', COALESCE(SUM(tax_liability), 0)
            FROM tax_filing {f'WHERE 1=1 {tax_year}' if tax_year else ''}
        """, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Revenue Total 

@router.get("/revenue-total")
def revenue_total(year: Optional[int] = Query(None)):
    """Total tuition revenue actually collected (payment_status = 'paid'), optionally by year."""
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT COALESCE(SUM(total_amount), 0) AS total_received FROM tuition_fee WHERE payment_status = 'paid'"
        params = []
        if year:
            sql += " AND year = %s"; params.append(year)
        cursor.execute(sql, params)
        row = cursor.fetchone()
        return {"total_received": float(row["total_received"])}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Budget Dashboard 

@router.get("/budget-dashboard")
def budget_dashboard(year: Optional[int] = Query(None)):
    """
    Returns per-department: allocated budget, total spent, surplus/deficit,
    staff count, student count, course count, club count.
    Optionally filtered by year (staff payments + club academic year).
    """
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        yr_staff = "AND sp.year = %s" if year else ""
        yr_club = "AND LEFT(cl2.academic_year, 4) = %s" if year else ""
        params = [year, str(year)] if year else []

        cursor.execute(f"""
            WITH dept_staff_pay AS (
                SELECT s.dept_abr,
                       COALESCE(SUM(sp.gross_pay), 0) AS staff_pay
                FROM   staff_payment sp
                JOIN   staff s ON sp.staff_id = s.staff_id
                WHERE  1=1 {yr_staff}
                GROUP  BY s.dept_abr
            ),
            dept_club_spend AS (
                SELECT s_cl.dept_abr,
                       COALESCE(SUM(cl2.spent_amount), 0) AS club_spend
                FROM   club cl2
                JOIN   staff s_cl ON cl2.staff_id = s_cl.staff_id
                WHERE  1=1 {yr_club}
                GROUP  BY s_cl.dept_abr
            ),
            dept_club_count AS (
                SELECT s_cl.dept_abr,
                       COUNT(DISTINCT cl3.club_id) AS club_count
                FROM   club cl3
                JOIN   staff s_cl ON cl3.staff_id = s_cl.staff_id
                GROUP  BY s_cl.dept_abr
            )
            SELECT
                d.abr,
                d.dept_name,
                d.budget_allocation,
                COALESCE(dsp.staff_pay,   0) +
                COALESCE(dcs.club_spend,  0) AS total_spent,
                d.budget_allocation
                    - COALESCE(dsp.staff_pay,  0)
                    - COALESCE(dcs.club_spend, 0) AS surplus_deficit,
                COUNT(DISTINCT s2.staff_id) AS staff_count,
                COUNT(DISTINCT st.student_id) AS student_count,
                COUNT(DISTINCT c.course_code) AS course_count,
                COALESCE(dcc.club_count, 0) AS club_count
            FROM      department d
            LEFT JOIN dept_staff_pay  dsp ON d.abr = dsp.dept_abr
            LEFT JOIN dept_club_spend dcs ON d.abr = dcs.dept_abr
            LEFT JOIN dept_club_count dcc ON d.abr = dcc.dept_abr
            LEFT JOIN staff           s2  ON d.abr = s2.dept_abr
            LEFT JOIN program         p   ON d.abr = p.dept_abr
            LEFT JOIN student         st  ON p.program_id = st.program_id
            LEFT JOIN course          c   ON d.abr = c.abr
            GROUP BY  d.abr, d.dept_name, d.budget_allocation,
                      dsp.staff_pay, dcs.club_spend, dcc.club_count
            ORDER BY  d.dept_name
        """, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# Scholarships 

@router.get("/scholarships")
def list_scholarship_awards():
    """All scholarship awards visible to finance — grouped by type and status."""
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                ss.student_id,
                ss.scholarship_id,
                s.first_name,
                s.last_name,
                s.email,
                sch.scholarship_name,
                sch.scholarship_type,
                sch.percent_coverage,
                sch.fixed_amount,
                sch.original_amount,
                sch.total_amount          AS remaining_pool,
                ss.status,
                ss.award_date,
                ss.percent_discount,
                ss.fixed_award
            FROM   student_scholarship ss
            JOIN   student     s   ON ss.student_id     = s.student_id
            JOIN   scholarship sch ON ss.scholarship_id = sch.scholarship_id
            ORDER  BY ss.status, ss.award_date DESC, s.last_name
        """)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# Tax Filings 

@router.get("/tax-filings")
def list_tax_filings(
    year:   Optional[int] = Query(None),
    status: Optional[str] = Query(None),
):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM tax_filing WHERE 1=1"
        params = []
        if year: sql += " AND fiscal_year = %s";    params.append(year)
        if status: sql += " AND filing_status = %s";  params.append(status)
        sql += " ORDER BY fiscal_year DESC"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/tax-filings", status_code=201)
def create_tax_filing(body: TaxFilingCreate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO tax_filing
                (fiscal_year, filing_date, filing_status, total_income, total_deductions,
                 employee_compensation, capital_expenditures, research_credits, tax_liability)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (body.fiscal_year, body.filing_date, body.filing_status,
             body.total_income, body.total_deductions, body.employee_compensation,
             body.capital_expenditures, body.research_credits, body.tax_liability),
        )
        conn.commit()
        return {"filing_id": cursor.lastrowid, "message": "Tax filing created"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.put("/tax-filings/{filing_id}")
def update_tax_filing(filing_id: int, body: TaxFilingUpdate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        fields = {k: v for k, v in body.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        cursor.execute(
            f"UPDATE tax_filing SET {set_clause} WHERE filing_id = %s",
            [*fields.values(), filing_id],
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Tax filing not found")
        return {"message": "Tax filing updated"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Utility Bills 

@router.get("/utility-bills")
def list_utility_bills(
    status: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    utility_type: Optional[str] = Query(None),
):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM utility_bill WHERE 1=1"
        params = []
        if status: sql += " AND payment_status = %s"; params.append(status)
        if year: sql += " AND billing_year = %s";   params.append(year)
        if utility_type: sql += " AND utility_type = %s";   params.append(utility_type)
        sql += " ORDER BY billing_year DESC, billing_month DESC"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/utility-bills", status_code=201)
def create_utility_bill(body: UtilityBillCreate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO utility_bill
                (building_name, building_type, utility_type, amount, billing_month, billing_year, payment_status)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            """,
            (body.building_name, body.building_type, body.utility_type,
             body.amount, body.billing_month, body.billing_year, body.payment_status),
        )
        conn.commit()
        return {"bill_id": cursor.lastrowid, "message": "Utility bill created"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.put("/utility-bills/{bill_id}")
def update_utility_bill(bill_id: int, body: UtilityBillUpdate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE utility_bill SET payment_status = %s WHERE bill_id = %s",
            (body.payment_status, bill_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Utility bill not found")
        return {"message": "Utility bill updated"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.delete("/utility-bills/{bill_id}", status_code=200)
def delete_utility_bill(bill_id: int):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM utility_bill WHERE bill_id = %s", (bill_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Utility bill not found")
        return {"message": "Utility bill deleted"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Misc Payments 

@router.get("/misc-payments")
def list_misc_payments(
    year:   Optional[int] = Query(None),
    status: Optional[str] = Query(None),
):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM misc_payment WHERE 1=1"
        params = []
        if year: sql += " AND YEAR(payment_date) = %s"; params.append(year)
        if status: sql += " AND payment_status = %s";     params.append(status)
        sql += " ORDER BY payment_date DESC"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/misc-payments", status_code=201)
def create_misc_payment(body: MiscPaymentCreate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO misc_payment
                (description, category, item_name, amount, payment_date, payment_status)
            VALUES (%s,%s,%s,%s,%s,%s)
            """,
            (body.description, body.category, body.item_name,
             body.amount, body.payment_date, body.payment_status),
        )
        conn.commit()
        return {"payment_id": cursor.lastrowid, "message": "Misc payment created"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.delete("/misc-payments/{payment_id}")
def delete_misc_payment(payment_id: int):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM misc_payment WHERE payment_id = %s", (payment_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Payment not found")
        return {"message": "Misc payment deleted"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
