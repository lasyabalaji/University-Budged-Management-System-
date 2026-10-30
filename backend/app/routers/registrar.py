from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import mysql.connector

from app.db import get_connection
from app.schemas.student import StudentCreate, StudentUpdate, EnrollmentRequest

router = APIRouter()


# Courses 

@router.get("/courses")
def list_courses(abr: Optional[str] = Query(None)):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT c.*, d.dept_name
            FROM course c
            JOIN department d ON c.abr = d.abr
            WHERE 1=1
        """
        params = []
        if abr:
            sql += " AND c.abr = %s"; params.append(abr)
        sql += " ORDER BY c.course_code"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


@router.get("/courses/{course_code}")
def get_course(course_code: str):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT c.*, d.dept_name FROM course c JOIN department d ON c.abr=d.abr WHERE c.course_code=%s",
            (course_code,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Course not found")
        return row
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


@router.post("/courses", status_code=201)
def create_course(
    abr: str,
    course_id: int,
    course_name: str,
    course_code: str,
    credit_hours: int,
):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO course (course_code, abr, course_id, course_name, credit_hours) VALUES (%s,%s,%s,%s,%s)",
            (course_code, abr, course_id, course_name, credit_hours),
        )
        conn.commit()
        return {"course_code": course_code, "message": "Course created"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


@router.put("/courses/{course_code}")
def update_course(
    course_code: str,
    course_name:  Optional[str] = None,
    credit_hours: Optional[int] = None,
):
    fields = {k: v for k, v in {
        "course_name": course_name,
        "credit_hours": credit_hours,
    }.items() if v is not None}

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor()
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        cursor.execute(
            f"UPDATE course SET {set_clause} WHERE course_code = %s",
            [*fields.values(), course_code],
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"message": "Course updated"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


@router.delete("/courses/{course_code}")
def delete_course(course_code: str):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM course WHERE course_code = %s", (course_code,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"message": "Course deleted"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        if e.errno == 1451:
            raise HTTPException(
                status_code=409,
                detail="This course cannot be deleted because students are currently enrolled in it. "
                       "Please remove all enrollments before deleting the course."
            )
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# Students 

@router.get("/students")
def list_students(search: Optional[str] = Query(None), program_id: Optional[int] = Query(None)):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT s.*, p.program_name, p.degree_level, d.dept_name
            FROM student s
            JOIN program p ON s.program_id = p.program_id
            JOIN department d ON p.dept_abr = d.abr
            WHERE 1=1
        """
        params = []
        if search:
            sql += " AND (s.first_name LIKE %s OR s.last_name LIKE %s OR s.email LIKE %s)"
            like = f"%{search}%"
            params.extend([like, like, like])
        if program_id:
            sql += " AND s.program_id = %s"; params.append(program_id)
        sql += " ORDER BY s.last_name, s.first_name"
        cursor.execute(sql, params)
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


@router.get("/students/{student_id}")
def get_student(student_id: int):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT s.*, p.program_name, p.degree_level, p.cost_per_credit, d.dept_name
            FROM student s
            JOIN program p ON s.program_id = p.program_id
            JOIN department d ON p.dept_abr = d.abr
            WHERE s.student_id = %s
            """,
            (student_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Student not found")
        return row
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


@router.post("/students", status_code=201)
def create_student(body: StudentCreate):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO student
                (program_id, first_name, last_name, email, enrollment_year, status)
            VALUES (%s,%s,%s,%s,%s,%s)
            """,
            (body.program_id, body.first_name, body.last_name,
             body.email, body.enrollment_year, body.status),
        )
        conn.commit()
        return {"student_id": cursor.lastrowid, "message": "Student registered"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


@router.put("/students/{student_id}")
def update_student(student_id: int, body: StudentUpdate):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor()
        fields = {k: v for k, v in body.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        cursor.execute(
            f"UPDATE student SET {set_clause} WHERE student_id = %s",
            [*fields.values(), student_id],
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Student not found")
        return {"message": "Student updated"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# Enrollment 

@router.post("/enrollment", status_code=201)
def enroll_student(body: EnrollmentRequest):
    """
    Calls sp_enroll_student_semester which calculates tuition as
    cost_per_credit × 15 credits from the student's program and
    upserts a tuition_fee record for the given semester.
    """
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor()
        cursor.callproc(
            "sp_enroll_student_semester",
            [body.student_id, body.semester_name, body.year],
        )
        conn.commit()
        return {
            "message":    "Enrollment successful — tuition fee generated",
            "student_id": body.student_id,
            "semester":   body.semester_name,
            "year":       body.year,
        }
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# Tuition Comparison 

@router.get("/tuition-comparison")
def tuition_comparison():
    """
    Per-semester tuition revenue breakdown:
      gross_tuition = credit_hours × cost_per_credit (before any scholarship)
      percent_discount = gross - total_amount (percent scholarships baked into total_amount by trigger)
      expected_revenue = SUM(total_amount)  (post-percent-discount, what students owe)
      actual_revenue = paid tuition fees
      outstanding = expected - actual
    Plus a total_fixed_credits figure (one-time fixed awards, not per-semester).
    """
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                tf.semester_name,
                tf.year,
                COUNT(DISTINCT tf.student_id) AS student_count,
                ROUND(SUM(tf.total_credit_hours * p.cost_per_credit), 2) AS gross_tuition,
                ROUND(SUM(tf.total_credit_hours * p.cost_per_credit)
                      - SUM(tf.total_amount), 2) AS percent_discount,
                ROUND(SUM(tf.total_amount), 2) AS expected_revenue,
                ROUND(SUM(CASE WHEN tf.payment_status = 'paid'
                               THEN tf.total_amount ELSE 0 END), 2) AS actual_revenue,
                ROUND(SUM(tf.total_amount)
                      - SUM(CASE WHEN tf.payment_status = 'paid'
                                 THEN tf.total_amount ELSE 0 END), 2) AS outstanding
            FROM tuition_fee tf
            JOIN student s ON tf.student_id  = s.student_id
            JOIN program p ON s.program_id = p.program_id
            GROUP BY tf.semester_name, tf.year
            ORDER BY tf.year DESC, tf.semester_name
        """)
        rows = cursor.fetchall()
        cursor.execute("""
            SELECT COALESCE(SUM(fixed_award), 0) AS total_fixed_credits
            FROM student_scholarship
            WHERE status = 'approved' AND fixed_award IS NOT NULL
        """)
        fixed = cursor.fetchone()

        return {
            "rows": rows,
            "total_fixed_credits": float(fixed["total_fixed_credits"]),
        }
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# Departments

@router.get("/departments")
def list_departments():
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM department ORDER BY dept_name")
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()
