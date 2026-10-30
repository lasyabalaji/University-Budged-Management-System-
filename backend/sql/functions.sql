-- =============================================================
-- UBMS — User-Defined Functions
-- Run after schema.sql
-- =============================================================
USE ubms;

DELIMITER $$

-- --------------------------------------------------------
-- fn_calculate_tuition
-- Returns total tuition owed for a student in a semester:
--   SUM(credit_hours for enrolled courses) × program.cost_per_credit
-- --------------------------------------------------------
DROP FUNCTION IF EXISTS fn_calculate_tuition $$

CREATE FUNCTION fn_calculate_tuition(
    p_student_id INT,
    p_semester VARCHAR(10),
    p_year SMALLINT
)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(10,2) DEFAULT 0.00;

    SELECT COALESCE(
               (SELECT SUM(c2.credit_hours) FROM course_registration cr2
                JOIN course c2 ON cr2.course_code = c2.course_code
                WHERE cr2.student_id = p_student_id
                  AND cr2.semester_name = p_semester
                  AND cr2.year = p_year)
               * p.cost_per_credit, 0.00)
    INTO v_total
    FROM student s
    JOIN program p ON s.program_id = p.program_id
    WHERE s.student_id = p_student_id;

    RETURN COALESCE(v_total, 0.00);
END $$

-- --------------------------------------------------------
-- fn_total_budget_spent
-- Returns total amount spent by a department:
--   staff gross pay + club spending
-- --------------------------------------------------------
DROP FUNCTION IF EXISTS fn_total_budget_spent $$

CREATE FUNCTION fn_total_budget_spent(p_dept_abr VARCHAR(10))
RETURNS DECIMAL(12,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_staff_pay  DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_club_spend DECIMAL(12,2) DEFAULT 0.00;

    SELECT COALESCE(SUM(sp.gross_pay), 0.00)
    INTO v_staff_pay
    FROM staff_payment sp
    JOIN staff s ON sp.staff_id = s.staff_id
    WHERE s.dept_abr = p_dept_abr;

    SELECT COALESCE(SUM(spent_amount), 0.00)
    INTO v_club_spend
    FROM club
    WHERE dept_abr = p_dept_abr;

    RETURN v_staff_pay + v_club_spend;
END $$

-- --------------------------------------------------------
-- fn_scholarship_balance
-- Returns remaining funds in a scholarship pool.
-- The procedure sp_approve_scholarship deducts from total_amount,
-- so the balance is simply the current total_amount.
-- --------------------------------------------------------
DROP FUNCTION IF EXISTS fn_scholarship_balance $$

CREATE FUNCTION fn_scholarship_balance(p_scholarship_id INT)
RETURNS DECIMAL(12,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_balance DECIMAL(12,2) DEFAULT 0.00;

    SELECT total_amount
    INTO v_balance
    FROM scholarship
    WHERE scholarship_id = p_scholarship_id;

    RETURN COALESCE(v_balance, 0.00);
END $$

-- --------------------------------------------------------
-- fn_student_net_earnings
-- Returns total gross pay earned by a student across all paid payroll records.
-- --------------------------------------------------------
DROP FUNCTION IF EXISTS fn_student_net_earnings $$

CREATE FUNCTION fn_student_net_earnings(p_student_id INT)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(10,2) DEFAULT 0.00;

    SELECT COALESCE(SUM(gross_pay), 0.00)
    INTO v_total
    FROM payroll
    WHERE student_id = p_student_id
      AND payment_status = 'paid';

    RETURN v_total;
END $$

DELIMITER;