-- =============================================================
-- UBMS — Stored Procedures
-- Run after schema.sql and functions.sql
-- =============================================================
USE ubms;

DELIMITER $$

-- --------------------------------------------------------
-- sp_enroll_student
-- Inserts one course_registration row per course in the
-- comma-separated p_course_codes list.
-- The AFTER INSERT trigger on course_registration automatically
-- creates/updates the tuition_fee record for the semester.
-- --------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_enroll_student $$

CREATE PROCEDURE sp_enroll_student(
    IN p_student_id INT,
    IN p_semester VARCHAR(10),
    IN p_year SMALLINT,
    IN p_course_codes TEXT          -- e.g. 'CS101,CS301,BUS201'
)
BEGIN
    DECLARE v_temp TEXT;
    DECLARE v_pos INT;
    DECLARE v_course_code VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Ensure the semester row exists
    INSERT IGNORE INTO semester (semester_name, year)
    VALUES (p_semester, p_year);

    SET v_temp = TRIM(p_course_codes);

    parse_loop: WHILE LENGTH(v_temp) > 0 DO
        SET v_pos = LOCATE(',', v_temp);

        IF v_pos > 0 THEN
            SET v_course_code = TRIM(SUBSTRING(v_temp, 1, v_pos - 1));
            SET v_temp = TRIM(SUBSTRING(v_temp, v_pos + 1));
        ELSE
            SET v_course_code = TRIM(v_temp);
            SET v_temp = '';
        END IF;

        IF LENGTH(v_course_code) > 0 THEN
            INSERT INTO course_registration (student_id, course_code, semester_name, year)
            VALUES (p_student_id, v_course_code, p_semester, p_year);
        END IF;
    END WHILE parse_loop;

    COMMIT;
END $$

-- --------------------------------------------------------
-- sp_process_staff_payment
-- Computes monthly gross pay (annual salary / 12),
-- applies a 20 % deduction, and inserts a staff_payment record.
-- Uses ON DUPLICATE KEY UPDATE so it is safe to re-run.
-- --------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_process_staff_payment $$

CREATE PROCEDURE sp_process_staff_payment(
    IN p_staff_id INT,
    IN p_month TINYINT,
    IN p_year SMALLINT
)
BEGIN
    DECLARE v_salary DECIMAL(10,2);
    DECLARE v_gross DECIMAL(10,2);
    DECLARE v_deductions DECIMAL(10,2);
    DECLARE v_net DECIMAL(10,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT salary INTO v_salary
    FROM staff
    WHERE staff_id = p_staff_id
      AND status = 'active';

    IF v_salary IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Active staff member not found';
    END IF;

    SET v_gross = ROUND(v_salary / 12, 2);
    SET v_deductions = ROUND(v_gross * 0.20, 2);
    SET v_net = v_gross - v_deductions;

    INSERT INTO staff_payment
        (staff_id, month, year, gross_pay, deductions, net_pay, payment_date, payment_status)
    VALUES
        (p_staff_id, p_month, p_year, v_gross, v_deductions, v_net, CURDATE(), 'paid')
    ON DUPLICATE KEY UPDATE
        gross_pay = v_gross,
        deductions = v_deductions,
        net_pay = v_net,
        payment_date = CURDATE(),
        payment_status = 'paid';

    COMMIT;
END $$

-- --------------------------------------------------------
-- sp_approve_scholarship
-- Awards a scholarship to a student:
--  1. Calculates award = percent_coverage % of their most recent unpaid tuition
--  2. Checks that the scholarship pool has sufficient funds
--  3. Updates student_scholarship (status, percent_discount / fixed_award, award_date)
--  4. Deducts fixed_award from scholarship.total_amount (fixed type only)
-- --------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_approve_scholarship $$

CREATE PROCEDURE sp_approve_scholarship(
    IN p_student_id INT,
    IN p_scholarship_id INT,
    IN p_staff_id INT
)
BEGIN
    DECLARE v_sch_type VARCHAR(10);
    DECLARE v_percent DECIMAL(5,2);
    DECLARE v_fixed DECIMAL(10,2);
    DECLARE v_pool DECIMAL(12,2);
    DECLARE v_outstanding DECIMAL(10,2);
    DECLARE v_actual_award DECIMAL(10,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT scholarship_type, percent_coverage, fixed_amount, total_amount
    INTO v_sch_type, v_percent, v_fixed, v_pool
    FROM scholarship
    WHERE scholarship_id = p_scholarship_id;

    IF v_sch_type = 'percent' THEN
        -- Percent scholarship: approve and immediately apply the discount to all
        -- existing unpaid tuition_fee records. Future fees handled by the trigger.
        UPDATE student_scholarship
        SET status = 'approved',
               award_date = CURDATE(),
               percent_discount = v_percent,
               fixed_award = NULL,
               approved_by = p_staff_id
        WHERE student_id = p_student_id
          AND scholarship_id = p_scholarship_id;

        UPDATE tuition_fee
        SET total_amount = ROUND(total_amount * (1 - v_percent / 100), 2)
        WHERE student_id = p_student_id
          AND payment_status IN ('unpaid', 'overdue');

    ELSE
        -- Fixed scholarship: cap the award at the student's outstanding tuition balance.
        -- If the student has no outstanding balance yet (not enrolled), award the full amount.
        SELECT COALESCE(SUM(total_amount), 0) INTO v_outstanding
        FROM tuition_fee
        WHERE student_id = p_student_id
          AND payment_status IN ('unpaid', 'overdue');

        IF v_outstanding > 0 THEN
            SET v_actual_award = LEAST(v_fixed, v_outstanding);
        ELSE
            SET v_actual_award = v_fixed;
        END IF;

        IF v_pool < v_actual_award THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Insufficient scholarship funds to approve this award';
        END IF;

        UPDATE student_scholarship
        SET status = 'approved',
               award_date = CURDATE(),
               percent_discount = NULL,
               fixed_award = v_actual_award,
               approved_by = p_staff_id
        WHERE student_id = p_student_id
          AND scholarship_id = p_scholarship_id;

        -- Deduct only the actual award, not the full fixed_amount.
        -- Any unused portion stays in the pool for future applicants.
        UPDATE scholarship
        SET total_amount = total_amount - v_actual_award
        WHERE scholarship_id = p_scholarship_id;
    END IF;

    COMMIT;
END $$

-- --------------------------------------------------------
-- sp_approve_club_funding
-- Sets a club's approval_status to 'approved' and records
-- the allocated amount.
-- --------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_approve_club_funding $$

CREATE PROCEDURE sp_approve_club_funding(
    IN p_club_id INT,
    IN p_amount DECIMAL(10,2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    IF p_amount < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Allocated amount cannot be negative';
    END IF;

    UPDATE club
    SET approval_status  = 'approved',
           allocated_amount = p_amount
    WHERE  club_id = p_club_id;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Club not found';
    END IF;

    COMMIT;
END $$

-- --------------------------------------------------------
-- sp_process_student_payroll
-- Looks up the job hourly_rate, computes gross pay, and
-- inserts a new payroll record for a student.
-- --------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_process_student_payroll $$

CREATE PROCEDURE sp_process_student_payroll(
    IN p_student_id INT,
    IN p_job_id INT,
    IN p_hours DECIMAL(6,2),
    IN p_period_start DATE,
    IN p_period_end DATE
)
BEGIN
    DECLARE v_rate DECIMAL(6,2);
    DECLARE v_gross DECIMAL(10,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    IF p_hours < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Hours worked cannot be negative';
    END IF;

    IF p_period_end < p_period_start THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Period end must be on or after period start';
    END IF;

    SELECT hourly_rate INTO v_rate
    FROM on_campus_job
    WHERE job_id = p_job_id;

    IF v_rate IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Job not found';
    END IF;

    SET v_gross = ROUND(p_hours * v_rate, 2);

    INSERT INTO payroll
        (student_id, job_id, period_start, period_end, hours_worked, gross_pay, payment_status, payment_date)
    VALUES
        (p_student_id, p_job_id, p_period_start, p_period_end, p_hours, v_gross, 'paid', CURDATE());

    COMMIT;
END $$

-- --------------------------------------------------------
-- sp_enroll_student_semester
-- Enrolls a student for a semester and generates a tuition fee
-- based on their program's cost_per_credit × 15 credit hours.
-- Upserts tuition_fee so it is safe to re-run.
-- --------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_enroll_student_semester $$

CREATE PROCEDURE sp_enroll_student_semester(
    IN p_student_id INT,
    IN p_semester VARCHAR(10),
    IN p_year SMALLINT
)
BEGIN
    DECLARE v_cost_per_credit DECIMAL(8,2);
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_credit_hours TINYINT DEFAULT 9;
    DECLARE v_due_date DATE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Fetch cost_per_credit from the student's enrolled program
    SELECT p.cost_per_credit INTO v_cost_per_credit
    FROM student s
    JOIN program p ON s.program_id = p.program_id
    WHERE s.student_id = p_student_id;

    IF v_cost_per_credit IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Student or program not found';
    END IF;

    SET v_total_amount = ROUND(v_cost_per_credit * v_credit_hours, 2);

    -- Due date: end of each semester period
    SET v_due_date = CASE p_semester
        WHEN 'Fall' THEN STR_TO_DATE(CONCAT(p_year, '-12-15'), '%Y-%m-%d')
        WHEN 'Spring' THEN STR_TO_DATE(CONCAT(p_year, '-05-15'), '%Y-%m-%d')
        WHEN 'Summer' THEN STR_TO_DATE(CONCAT(p_year, '-08-15'), '%Y-%m-%d')
        ELSE DATE_ADD(CURDATE(), INTERVAL 60 DAY)
    END;

    INSERT IGNORE INTO semester (semester_name, year)
    VALUES (p_semester, p_year);

    INSERT INTO tuition_fee
        (student_id, semester_name, year, total_credit_hours, total_amount, due_date, payment_status)
    VALUES
        (p_student_id, p_semester, p_year, v_credit_hours, v_total_amount, v_due_date, 'unpaid')
    ON DUPLICATE KEY UPDATE
        total_credit_hours = v_credit_hours,
        total_amount = v_total_amount,
        due_date = v_due_date;

    COMMIT;
END $$

DELIMITER;