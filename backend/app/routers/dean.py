from fastapi import APIRouter, HTTPException
import mysql.connector

from app.db import get_connection
from app.schemas.scholarship import ScholarshipCreate, ScholarshipDecision
from app.schemas.club import ClubCreate, ClubFundingDecision, ProgramCostUpdate
from app.schemas.department import DepartmentCreate, DepartmentUpdate

router = APIRouter()


#  Departments 

@router.get("/departments")
def list_departments():
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT d.*,
                   COUNT(DISTINCT p.program_id) AS program_count,
                   COUNT(DISTINCT s.staff_id)   AS staff_count
            FROM department d
            LEFT JOIN program p ON p.dept_abr = d.abr
            LEFT JOIN staff s ON s.dept_abr = d.abr AND s.status = 'active'
            GROUP BY d.abr
            ORDER BY d.dept_name
        """)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/departments", status_code=201)
def create_department(body: DepartmentCreate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO department (abr, dept_name, budget_allocation) VALUES (%s,%s,%s)",
            (body.abr.upper(), body.dept_name, body.budget_allocation),
        )
        conn.commit()
        return {"abr": body.abr.upper(), "message": "Department created"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.put("/departments/{abr}")
def update_department(abr: str, body: DepartmentUpdate):
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        cursor.execute(
            f"UPDATE department SET {set_clause} WHERE abr = %s",
            [*fields.values(), abr.upper()],
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Department not found")
        return {"message": "Department updated"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.delete("/departments/{abr}")
def delete_department(abr: str):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM department WHERE abr = %s", (abr.upper(),))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Department not found")
        return {"message": "Department deleted"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Scholarships 

@router.get("/scholarships")
def list_scholarships():
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT s.*,
                   fn_scholarship_balance(s.scholarship_id) AS remaining_balance,
                   COUNT(ss.student_id)                     AS total_applications,
                   SUM(ss.status = 'approved')              AS approved_count
            FROM   scholarship s
            LEFT JOIN student_scholarship ss ON s.scholarship_id = ss.scholarship_id
            GROUP BY s.scholarship_id
            ORDER BY s.scholarship_name
        """)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/scholarships", status_code=201)
def create_scholarship(body: ScholarshipCreate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO scholarship
                (scholarship_name, scholarship_type, percent_coverage,
                 fixed_amount, original_amount, total_amount, eligibility_criteria, created_by)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (body.scholarship_name, body.scholarship_type, body.percent_coverage,
             body.fixed_amount, body.total_amount, body.total_amount,
             body.eligibility_criteria, body.created_by),
        )
        conn.commit()
        return {"scholarship_id": cursor.lastrowid, "message": "Scholarship created"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.delete("/scholarships/{scholarship_id}")
def delete_scholarship(scholarship_id: int):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM scholarship WHERE scholarship_id = %s", (scholarship_id,)
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Scholarship not found")
        return {"message": "Scholarship deleted"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Scholarship Applications 

@router.get("/scholarship-applications")
def list_applications(status: str = "pending"):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT ss.student_id, ss.scholarship_id, ss.status,
                   ss.award_date, ss.percent_discount, ss.fixed_award,
                   s.first_name, s.last_name, s.email,
                   sch.scholarship_name, sch.scholarship_type,
                   sch.percent_coverage, sch.fixed_amount,
                   fn_scholarship_balance(sch.scholarship_id) AS remaining_balance
            FROM student_scholarship ss
            JOIN student s ON ss.student_id = s.student_id
            JOIN scholarship sch ON ss.scholarship_id = sch.scholarship_id
            WHERE ss.status = %s
            ORDER BY s.last_name, s.first_name
            """,
            (status,),
        )
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.put("/scholarship-applications/{student_id}/{scholarship_id}")
def decide_application(student_id: int, scholarship_id: int, body: ScholarshipDecision):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if body.action == "approve":
            cursor.callproc("sp_approve_scholarship", [student_id, scholarship_id, body.staff_id])
        elif body.action == "hold":
            cursor.execute(
                """
                UPDATE student_scholarship
                SET status = 'on_hold'
                WHERE student_id = %s AND scholarship_id = %s
                """,
                (student_id, scholarship_id),
            )
        else:
            cursor.execute(
                """
                UPDATE student_scholarship
                SET status = 'rejected'
                WHERE student_id = %s AND scholarship_id = %s
                """,
                (student_id, scholarship_id),
            )

        conn.commit()
        action_label = {"approve": "approved", "reject": "rejected", "hold": "put on hold"}
        return {"message": f"Application {action_label.get(body.action, body.action)}"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Clubs 

@router.get("/clubs")
def list_clubs():
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.*,
                   CONCAT(s.first_name, ' ', s.last_name) AS staff_name,
                   s.dept_abr,
                   d.dept_name
            FROM club c
            LEFT JOIN staff s ON c.staff_id  = s.staff_id
            LEFT JOIN department d ON s.dept_abr  = d.abr
            ORDER BY c.approval_status, c.club_name
        """)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/clubs", status_code=201)
def create_club(body: ClubCreate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO club
                (staff_id, club_name, club_category, funding_source, academic_year,
                 allocated_amount, spent_amount, approval_status)
            VALUES (%s,%s,%s,%s,%s, 0.00, 0.00, 'pending')
            """,
            (body.staff_id, body.club_name, body.club_category,
             body.funding_source, body.academic_year),
        )
        conn.commit()
        return {"club_id": cursor.lastrowid, "message": "Club funding request submitted"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.put("/clubs/{club_id}")
def decide_club_funding(club_id: int, body: ClubFundingDecision):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if body.action == "approve":
            if body.amount is None or body.amount < 0:
                raise HTTPException(status_code=400, detail="Valid amount required for approval")
            cursor.callproc("sp_approve_club_funding", [club_id, body.amount])
        else:
            cursor.execute(
                "UPDATE club SET approval_status = 'rejected' WHERE club_id = %s",
                (club_id,),
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Club not found")

        conn.commit()
        return {"message": f"Club funding {body.action}d"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.delete("/clubs/{club_id}")
def delete_club(club_id: int):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM club WHERE club_id = %s", (club_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Club not found")
        return {"message": "Club deleted"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Programs (cost-per-credit)

@router.get("/programs")
def list_programs():
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.*, d.dept_name,
                   COUNT(DISTINCT s.student_id) AS enrolled_students
            FROM program p
            JOIN department d ON p.dept_abr = d.abr
            LEFT JOIN student s ON p.program_id = s.program_id
            GROUP BY p.program_id
            ORDER BY p.program_name
        """)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.put("/programs/{program_id}/cost-per-credit")
def update_cost_per_credit(program_id: int, body: ProgramCostUpdate):
    if body.cost_per_credit < 0:
        raise HTTPException(status_code=400, detail="cost_per_credit must be non-negative")
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE program SET cost_per_credit = %s WHERE program_id = %s",
            (body.cost_per_credit, program_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Program not found")
        return {"message": "Cost per credit updated"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
