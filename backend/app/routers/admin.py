from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import mysql.connector

from app.db import get_connection
from app.schemas.staff import StaffCreate, StaffUpdate, StaffPaymentProcess
from app.schemas.job import JobCreate, JobUpdate, PayrollCreate

router = APIRouter()


# Staff

@router.get("/staff")
def list_staff(search: Optional[str] = Query(None)):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT s.staff_id, s.dept_abr, d.dept_name,
                   s.first_name, s.last_name, s.role, s.salary,
                   s.hire_date, s.email, s.status, s.staff_type, s.reports_to,
                   f.academic_rank,
                   ss.category
            FROM staff s
            LEFT JOIN department d  ON s.dept_abr = d.abr
            LEFT JOIN faculty f ON s.staff_id = f.staff_id
            LEFT JOIN support_staff ss ON s.staff_id = ss.staff_id
            WHERE  1=1
        """
        params = []
        if search:
            sql += " AND (s.first_name LIKE %s OR s.last_name LIKE %s OR s.email LIKE %s)"
            like = f"%{search}%"
            params.extend([like, like, like])
        sql += " ORDER BY s.last_name, s.first_name"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.get("/staff/{staff_id}")
def get_staff(staff_id: int):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT s.*, d.dept_name, f.academic_rank, ss.category
            FROM staff s
            LEFT JOIN department d  ON s.dept_abr = d.abr
            LEFT JOIN faculty f ON s.staff_id = f.staff_id
            LEFT JOIN support_staff ss ON s.staff_id = ss.staff_id
            WHERE  s.staff_id = %s
            """,
            (staff_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Staff member not found")
        return row
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/staff", status_code=201)
def create_staff(body: StaffCreate):
    if body.staff_type == "faculty" and not body.academic_rank:
        raise HTTPException(status_code=400, detail="academic_rank required for faculty")
    if body.staff_type == "support_staff" and not body.category:
        raise HTTPException(status_code=400, detail="category required for support_staff")

    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO staff
                (dept_abr, first_name, last_name, role, salary, hire_date,
                 email, status, staff_type, reports_to)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (body.dept_abr, body.first_name, body.last_name, body.role,
             body.salary, body.hire_date, body.email, "active",
             body.staff_type, body.reports_to),
        )
        staff_id = cursor.lastrowid

        if body.staff_type == "faculty":
            cursor.execute(
                "INSERT INTO faculty (staff_id, academic_rank) VALUES (%s,%s)",
                (staff_id, body.academic_rank),
            )
        else:
            cursor.execute(
                "INSERT INTO support_staff (staff_id, category) VALUES (%s,%s)",
                (staff_id, body.category),
            )

        conn.commit()
        return {"staff_id": staff_id, "message": "Staff member created"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.put("/staff/{staff_id}")
def update_staff(staff_id: int, body: StaffUpdate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        staff_fields = {
            k: v for k, v in body.model_dump().items()
            if v is not None and k not in ("academic_rank", "category")
        }
        if staff_fields:
            set_clause = ", ".join(f"{k} = %s" for k in staff_fields)
            cursor.execute(
                f"UPDATE staff SET {set_clause} WHERE staff_id = %s",
                [*staff_fields.values(), staff_id],
            )

        if body.academic_rank is not None:
            cursor.execute(
                "UPDATE faculty SET academic_rank = %s WHERE staff_id = %s",
                (body.academic_rank, staff_id),
            )
        if body.category is not None:
            cursor.execute(
                "UPDATE support_staff SET category = %s WHERE staff_id = %s",
                (body.category, staff_id),
            )

        conn.commit()
        return {"message": "Staff member updated"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.delete("/staff/{staff_id}")
def deactivate_staff(staff_id: int):
    """Soft-delete: sets status = 'inactive'."""
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE staff SET status = 'inactive' WHERE staff_id = %s", (staff_id,)
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Staff member not found")
        return {"message": "Staff member deactivated"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Staff Payments 

@router.post("/staff-payments")
def process_staff_payment(body: StaffPaymentProcess):
    """Calls sp_process_staff_payment to calculate and record monthly pay."""
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.callproc("sp_process_staff_payment", [body.staff_id, body.month, body.year])
        conn.commit()
        return {"message": "Staff payment processed"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.get("/staff-payments")
def list_staff_payments(staff_id: Optional[int] = Query(None)):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT sp.*, s.first_name, s.last_name, s.email
            FROM staff_payment sp
            JOIN staff s ON sp.staff_id = s.staff_id
            WHERE 1=1
        """
        params = []
        if staff_id:
            sql += " AND sp.staff_id = %s"; params.append(staff_id)
        sql += " ORDER BY sp.year DESC, sp.month DESC"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# On-Campus Jobs 

@router.get("/jobs")
def list_jobs(status: Optional[str] = Query(None)):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM on_campus_job WHERE 1=1"
        params = []
        if status:
            sql += " AND availability_status = %s"; params.append(status)
        sql += " ORDER BY title"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/jobs", status_code=201)
def create_job(body: JobCreate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO on_campus_job
                (title, positions_available, description, hourly_rate, availability_status)
            VALUES (%s,%s,%s,%s,%s)
            """,
            (body.title, body.positions_available, body.description,
             body.hourly_rate, body.availability_status),
        )
        conn.commit()
        return {"job_id": cursor.lastrowid, "message": "Job posting created"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.put("/jobs/{job_id}")
def update_job(job_id: int, body: JobUpdate):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        fields = {k: v for k, v in body.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        cursor.execute(
            f"UPDATE on_campus_job SET {set_clause} WHERE job_id = %s",
            [*fields.values(), job_id],
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"message": "Job updated"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.delete("/jobs/{job_id}")
def delete_job(job_id: int):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM on_campus_job WHERE job_id = %s", (job_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"message": "Job deleted"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Student Payroll 

@router.get("/payroll")
def list_payroll(student_id: Optional[int] = Query(None)):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT pr.*, s.first_name, s.last_name, j.title AS job_title
            FROM payroll pr
            JOIN student s ON pr.student_id = s.student_id
            JOIN on_campus_job j ON pr.job_id = j.job_id
            WHERE 1=1
        """
        params = []
        if student_id:
            sql += " AND pr.student_id = %s"; params.append(student_id)
        sql += " ORDER BY pr.period_end DESC"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/payroll", status_code=201)
def process_payroll(body: PayrollCreate):
    """Calls sp_process_student_payroll to compute gross pay and insert record."""
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.callproc(
            "sp_process_student_payroll",
            [body.student_id, body.job_id, body.hours_worked,
             body.period_start, body.period_end],
        )
        conn.commit()
        return {"message": "Payroll processed"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
