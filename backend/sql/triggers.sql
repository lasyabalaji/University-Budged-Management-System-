-- =============================================================
-- UBMS — Triggers
-- Run after schema.sql and functions.sql
-- =============================================================
USE ubms;

DELIMITER $$

-- --------------------------------------------------------
-- trg_check_credit_limit
-- Fires BEFORE INSERT on course_registration.
-- Enforces a maximum of 9 credit hours per student per semester.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS trg_check_credit_limit $$

CREATE TRIGGER trg_check_credit_limit
BEFORE INSERT ON course_registration
FOR EACH ROW
BEGIN
    DECLARE v_existing_credits INT;
    DECLARE v_new_credits INT;

    -- Sum credits already registered for this student-semester
    SELECT COALESCE(SUM(c.credit_hours), 0) INTO v_existing_credits
    FROM course_registration cr
    JOIN course c ON cr.course_code = c.course_code
    WHERE cr.student_id = NEW.student_id
      AND cr.semester_name = NEW.semester_name
      AND cr.year = NEW.year;

    -- Get the credit hours of the course being added
    SELECT credit_hours INTO v_new_credits
    FROM course
    WHERE course_code = NEW.course_code;

    IF (v_existing_credits + v_new_credits) > 9 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Registration denied: maximum of 9 credit hours per semester allowed';
    END IF;
END $$

-- --------------------------------------------------------
-- trg_after_registration_insert
-- Fires AFTER each INSERT on course_registration.
-- Recalculates the student's total credit hours and tuition
-- for the semester, then upserts the tuition_fee record.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS trg_after_registration_insert $$

CREATE TRIGGER trg_after_registration_insert
AFTER INSERT ON course_registration
FOR EACH ROW
BEGIN
    DECLARE v_total_credits TINYINT;
    DECLARE v_total_amount  DECIMAL(10,2);
    DECLARE v_due_date DATE;
    DECLARE v_discount_pct  DECIMAL(5,2) DEFAULT 0.00;

    -- Re-sum all enrolled credits for this student-semester (includes NEW row)
    SELECT SUM(c.credit_hours)
    INTO v_total_credits
    FROM course_registration cr
    JOIN course c ON cr.course_code = c.course_code
    WHERE cr.student_id = NEW.student_id
      AND cr.semester_name = NEW.semester_name
      AND cr.year = NEW.year;

    -- Gross tuition (credit hours × cost_per_credit)
    SET v_total_amount = fn_calculate_tuition(NEW.student_id, NEW.semester_name, NEW.year);

    -- Apply any approved percent scholarship discount directly to the stored amount
    SELECT LEAST(COALESCE(SUM(sch.percent_coverage), 0), 100)
    INTO v_discount_pct
    FROM student_scholarship ss
    JOIN scholarship sch ON ss.scholarship_id = sch.scholarship_id
    WHERE ss.student_id = NEW.student_id
      AND ss.status = 'approved'
      AND sch.scholarship_type = 'percent';

    SET v_total_amount = ROUND(v_total_amount * (1 - v_discount_pct / 100), 2);

    SET v_due_date = CASE NEW.semester_name
        WHEN 'Spring' THEN STR_TO_DATE(CONCAT(NEW.year, '-02-15'), '%Y-%m-%d')
        WHEN 'Summer' THEN STR_TO_DATE(CONCAT(NEW.year, '-06-15'), '%Y-%m-%d')
        WHEN 'Fall' THEN STR_TO_DATE(CONCAT(NEW.year, '-09-15'), '%Y-%m-%d')
        ELSE STR_TO_DATE(CONCAT(NEW.year, '-12-15'), '%Y-%m-%d')
    END;

    INSERT INTO tuition_fee
        (student_id, semester_name, year, total_credit_hours, total_amount, due_date, payment_status)
    VALUES
        (NEW.student_id, NEW.semester_name, NEW.year, v_total_credits, v_total_amount, v_due_date, 'unpaid')
    ON DUPLICATE KEY UPDATE
        total_credit_hours = v_total_credits,
        total_amount = v_total_amount;
END $$

-- --------------------------------------------------------
-- trg_check_job_limit
-- Fires BEFORE INSERT on payroll.
-- Enforces the business rule that a student may hold at most 2 on-campus jobs.
-- Only blocks when the student is being added to a job they do not already hold.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS trg_check_job_limit $$

CREATE TRIGGER trg_check_job_limit
BEFORE INSERT ON payroll
FOR EACH ROW
BEGIN
    DECLARE v_existing INT;
    DECLARE v_count INT;

    -- Check if this student already has a payroll record for this job
    SELECT COUNT(*) INTO v_existing
    FROM payroll
    WHERE student_id = NEW.student_id AND job_id = NEW.job_id;

    -- Only enforce when assigning to a brand-new job
    IF v_existing = 0 THEN
        SELECT COUNT(DISTINCT job_id) INTO v_count
        FROM payroll
        WHERE student_id = NEW.student_id;

        IF v_count >= 2 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Student cannot hold more than 2 on-campus jobs simultaneously';
        END IF;
    END IF;
END $$

-- --------------------------------------------------------
-- trg_check_club_overspend
-- Fires BEFORE UPDATE on club.
-- Prevents spent_amount from exceeding allocated_amount.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS trg_check_club_overspend $$

CREATE TRIGGER trg_check_club_overspend
BEFORE UPDATE ON club
FOR EACH ROW
BEGIN
    IF NEW.spent_amount > NEW.allocated_amount THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Club spending cannot exceed the allocated budget amount';
    END IF;
END $$

-- --------------------------------------------------------
-- trg_staff_salary_audit
-- Fires AFTER UPDATE on staff whenever the salary column changes.
-- Logs old and new salary to staff_salary_audit.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS trg_staff_salary_audit $$

CREATE TRIGGER trg_staff_salary_audit
AFTER UPDATE ON staff
FOR EACH ROW
BEGIN
    IF OLD.salary <> NEW.salary THEN
        INSERT INTO staff_salary_audit (staff_id, old_salary, new_salary, changed_at)
        VALUES (NEW.staff_id, OLD.salary, NEW.salary, NOW());
    END IF;
END $$

-- --------------------------------------------------------
-- trg_scholarship_original_amount
-- Fires BEFORE INSERT on scholarship.
-- Auto-sets original_amount = total_amount so callers never
-- need to supply it explicitly.
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS trg_scholarship_original_amount $$

CREATE TRIGGER trg_scholarship_original_amount
BEFORE INSERT ON scholarship
FOR EACH ROW
BEGIN
    SET NEW.original_amount = NEW.total_amount;
END $$

DELIMITER;