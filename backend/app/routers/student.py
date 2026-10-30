from fastapi import APIRouter, HTTPException, Query
from datetime import date
import mysql.connector

from app.db import get_connection
from app.schemas.job import TuitionPayRequest
from app.schemas.scholarship import ScholarshipApply
from app.schemas.student import CourseRegistrationRequest

router = APIRouter()


# Tuition Fees 

@router.get("/{student_id}/tuition")
def get_student_tuition(student_id: int):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT tf.*,
                   fn_calculate_tuition(tf.student_id, tf.semester_name, tf.year) AS calculated_amount
            FROM tuition_fee tf
            WHERE tf.student_id = %s
            ORDER BY tf.year DESC, tf.semester_name
            """,
            (student_id,),
        )
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


@router.put("/tuition/{fee_id}/pay")
def pay_tuition(fee_id: int, body: TuitionPayRequest):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT payment_status FROM tuition_fee WHERE fee_id = %s",
            (fee_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Tuition fee record not found")
        if row["payment_status"] == "paid":
            raise HTTPException(status_code=400, detail="Tuition fee is already paid")

        cursor.execute(
            """
            UPDATE tuition_fee
            SET payment_status = 'paid',
                payment_date = %s,
                payment_method = %s
            WHERE fee_id = %s
            """,
            (date.today(), body.payment_method, fee_id),
        )
        conn.commit()
        return {"message": "Tuition fee paid successfully"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# Course Registration 

@router.get("/{student_id}/available-courses")
def get_available_courses(
    student_id: int,
    semester_name: str = Query(...),
    year: int = Query(...),
):
    """
    Returns all courses in the student's program.
    Each row includes already_registered=1 if the student
    is already enrolled in that course for the given semester.
    """
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT c.course_code, c.abr, c.course_id, c.course_name, c.credit_hours,
                   d.dept_name,
                   IF(cr.course_code IS NOT NULL, 1, 0) AS already_registered
            FROM program_course pc
            JOIN course c  ON pc.course_code = c.course_code
            JOIN department d ON c.abr = d.abr
            JOIN student s  ON s.program_id = pc.program_id
            LEFT JOIN course_registration cr
                ON  cr.course_code = c.course_code
                AND cr.student_id = s.student_id
                AND cr.semester_name = %s
                AND cr.year = %s
            WHERE  s.student_id = %s
            ORDER  BY c.course_code
            """,
            (semester_name, year, student_id),
        )
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/{student_id}/register-courses", status_code=201)
def register_courses(student_id: int, body: CourseRegistrationRequest):
    """
    Registers a student for a set of courses via sp_enroll_student.
    The AFTER INSERT trigger on course_registration automatically
    creates / updates the tuition_fee record with the correct amount.
    """
    if not body.course_codes:
        raise HTTPException(status_code=400, detail="Select at least one course")

    course_codes_str = ",".join(body.course_codes)
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor()
        cursor.callproc(
            "sp_enroll_student",
            [student_id, body.semester_name, body.year, course_codes_str],
        )
        conn.commit()
        return {
            "message": "Courses registered — tuition updated",
            "courses_added": len(body.course_codes),
        }
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# Payroll History 

@router.get("/{student_id}/payroll")
def get_student_payroll(student_id: int):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT pr.*, j.title AS job_title, j.hourly_rate,
                   fn_student_net_earnings(%s) AS total_earnings
            FROM payroll pr
            JOIN on_campus_job j ON pr.job_id = j.job_id
            WHERE pr.student_id = %s
            ORDER BY pr.period_end DESC
            """,
            (student_id, student_id),
        )
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# Scholarships 

@router.get("/{student_id}/scholarships")
def get_student_scholarships(student_id: int):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT ss.*, sch.scholarship_name, sch.scholarship_type,
                   sch.percent_coverage, sch.fixed_amount, sch.eligibility_criteria
            FROM student_scholarship ss
            JOIN scholarship sch ON ss.scholarship_id = sch.scholarship_id
            WHERE ss.student_id = %s
            ORDER BY ss.status, sch.scholarship_name
            """,
            (student_id,),
        )
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/{student_id}/scholarships/apply", status_code=201)
def apply_scholarship(student_id: int, body: ScholarshipApply):
    if body.student_id != student_id:
        raise HTTPException(status_code=400, detail="student_id mismatch")
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Prevent duplicate applications
        cursor.execute(
            "SELECT status FROM student_scholarship WHERE student_id=%s AND scholarship_id=%s",
            (student_id, body.scholarship_id),
        )
        existing = cursor.fetchone()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Already applied — current status: {existing['status']}",
            )

        # For fixed scholarships, verify the pool can cover one more award
        cursor.execute(
            "SELECT scholarship_type, fixed_amount, total_amount FROM scholarship WHERE scholarship_id = %s",
            (body.scholarship_id,),
        )
        sch = cursor.fetchone()
        if sch and sch["scholarship_type"] == "fixed":
            if float(sch["total_amount"]) < float(sch["fixed_amount"]):
                raise HTTPException(
                    status_code=400,
                    detail="This scholarship has no remaining funds and is closed for new applications",
                )

        cursor.execute(
            """
            INSERT INTO student_scholarship (student_id, scholarship_id, status)
            VALUES (%s, %s, 'pending')
            """,
            (student_id, body.scholarship_id),
        )
        conn.commit()
        return {"message": "Scholarship application submitted"}
    except mysql.connector.Error as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Campus Jobs

@router.get("/{student_id}/jobs")
def get_student_jobs(student_id: int):
    conn = cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT DISTINCT j.*,
                   MIN(pr.period_start) AS start_date
            FROM payroll pr
            JOIN on_campus_job j ON pr.job_id = j.job_id
            WHERE pr.student_id = %s
            GROUP BY j.job_id
            """,
            (student_id,),
        )
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
