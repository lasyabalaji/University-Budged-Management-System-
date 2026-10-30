-- =============================================================
-- UBMS: University Budget Management System
-- =============================================================

DROP DATABASE IF EXISTS ubms;

CREATE DATABASE ubms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ubms;

-- --------------------------------------------------------
-- 1. department
-- --------------------------------------------------------
CREATE TABLE department (
    abr VARCHAR(10) PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    budget_allocation DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT chk_dept_budget CHECK (budget_allocation >= 0)
);

-- --------------------------------------------------------
-- 2. staff
-- --------------------------------------------------------
CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_abr VARCHAR(10) DEFAULT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    hire_date DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    staff_type ENUM('faculty', 'support_staff') NOT NULL,
    reports_to INT DEFAULT NULL,
    CONSTRAINT chk_salary CHECK (salary >= 0),
    CONSTRAINT fk_staff_dept FOREIGN KEY (dept_abr) REFERENCES department (abr) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_staff_reports FOREIGN KEY (reports_to) REFERENCES staff (staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 3. faculty
-- --------------------------------------------------------
CREATE TABLE faculty (
    staff_id INT PRIMARY KEY,
    academic_rank ENUM(
        'Lecturer',
        'Adjunct',
        'Assistant Professor',
        'Associate Professor',
        'Professor'
    ) NOT NULL,
    CONSTRAINT fk_faculty_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 4. support_staff
-- --------------------------------------------------------
CREATE TABLE support_staff (
    staff_id INT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    CONSTRAINT fk_ss_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 5. staff_salary_audit
-- --------------------------------------------------------
CREATE TABLE staff_salary_audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    old_salary DECIMAL(10, 2) NOT NULL,
    new_salary DECIMAL(10, 2) NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 6. staff_payment
-- --------------------------------------------------------
CREATE TABLE staff_payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    month TINYINT NOT NULL,
    year SMALLINT NOT NULL,
    gross_pay DECIMAL(10, 2) NOT NULL,
    deductions DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    net_pay DECIMAL(10, 2) NOT NULL,
    payment_date DATE DEFAULT NULL,
    payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
    CONSTRAINT chk_sp_month CHECK (month BETWEEN 1 AND 12),
    CONSTRAINT chk_sp_gross CHECK (gross_pay >= 0),
    CONSTRAINT chk_sp_ded CHECK (deductions >= 0),
    CONSTRAINT chk_sp_net CHECK (net_pay >= 0),
    CONSTRAINT uq_staff_pay UNIQUE (staff_id, month, year),
    CONSTRAINT fk_sp_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 7. program
-- --------------------------------------------------------
CREATE TABLE program (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_abr VARCHAR(10) NOT NULL,
    program_name VARCHAR(150) NOT NULL,
    degree_level ENUM('Bachelors', 'Masters') NOT NULL,
    duration_years TINYINT NOT NULL DEFAULT 2,
    cost_per_credit DECIMAL(8, 2) NOT NULL,
    CONSTRAINT chk_prog_dur CHECK (duration_years > 0),
    CONSTRAINT chk_prog_cost CHECK (cost_per_credit >= 0),
    CONSTRAINT fk_prog_dept FOREIGN KEY (dept_abr) REFERENCES department (abr) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 8. course
-- --------------------------------------------------------
CREATE TABLE course (
    course_code VARCHAR(20) NOT NULL,
    abr VARCHAR(10) NOT NULL,
    course_id INT NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    credit_hours TINYINT NOT NULL DEFAULT 3,
    PRIMARY KEY (course_code),
    CONSTRAINT uq_abr_cid UNIQUE (abr, course_id),
    CONSTRAINT chk_credits CHECK (credit_hours > 0),
    CONSTRAINT fk_course_dept FOREIGN KEY (abr) REFERENCES department (abr) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 9. program_course
-- --------------------------------------------------------
CREATE TABLE program_course (
    program_id INT NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    PRIMARY KEY (program_id, course_code),
    CONSTRAINT fk_pc_program FOREIGN KEY (program_id) REFERENCES program (program_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pc_course FOREIGN KEY (course_code) REFERENCES course (course_code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 10. student
-- --------------------------------------------------------
CREATE TABLE student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    enrollment_year SMALLINT NOT NULL,
    status ENUM(
        'active',
        'alumni',
        'suspended'
    ) NOT NULL DEFAULT 'active',
    CONSTRAINT fk_student_prog FOREIGN KEY (program_id) REFERENCES program (program_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 11. semester
-- --------------------------------------------------------
CREATE TABLE semester (
    semester_name VARCHAR(10) NOT NULL,
    year SMALLINT NOT NULL,
    PRIMARY KEY (semester_name, year),
    CONSTRAINT chk_sem_name CHECK (
        semester_name IN ('Fall', 'Spring', 'Summer')
    ),
    CONSTRAINT chk_sem_year CHECK (year >= 2000)
);

-- --------------------------------------------------------
-- 12. course_registration
-- --------------------------------------------------------
CREATE TABLE course_registration (
    student_id INT NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    semester_name VARCHAR(10) NOT NULL,
    year SMALLINT NOT NULL,
    PRIMARY KEY (
        student_id,
        course_code,
        semester_name,
        year
    ),
    CONSTRAINT fk_cr_student FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cr_course FOREIGN KEY (course_code) REFERENCES course (course_code) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cr_semester FOREIGN KEY (semester_name, year) REFERENCES semester (semester_name, year) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 13. tuition_fee
-- --------------------------------------------------------
CREATE TABLE tuition_fee (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    semester_name VARCHAR(10) NOT NULL,
    year SMALLINT NOT NULL,
    total_credit_hours TINYINT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE DEFAULT NULL,
    payment_method VARCHAR(50) DEFAULT NULL,
    payment_status ENUM(
        'unpaid',
        'paid',
        'overdue',
        'waived'
    ) NOT NULL DEFAULT 'unpaid',
    CONSTRAINT chk_tf_credits CHECK (total_credit_hours > 0),
    CONSTRAINT chk_tf_amount CHECK (total_amount >= 0),
    CONSTRAINT uq_tuition UNIQUE (
        student_id,
        semester_name,
        year
    ),
    CONSTRAINT fk_tf_student FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 14. scholarship
-- --------------------------------------------------------
CREATE TABLE scholarship (
    scholarship_id INT AUTO_INCREMENT PRIMARY KEY,
    scholarship_name VARCHAR(150) NOT NULL,
    scholarship_type ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
    percent_coverage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    fixed_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    original_amount DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    CONSTRAINT chk_sch_pct CHECK (
        percent_coverage >= 0
        AND percent_coverage <= 100
    ),
    CONSTRAINT chk_sch_fixed CHECK (fixed_amount >= 0),
    CONSTRAINT chk_sch_amt CHECK (total_amount >= 0),
    created_by INT DEFAULT NULL,
    CONSTRAINT fk_sch_created_by FOREIGN KEY (created_by) REFERENCES staff (staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 15. student_scholarship
-- --------------------------------------------------------
CREATE TABLE student_scholarship (
    student_id INT NOT NULL,
    scholarship_id INT NOT NULL,
    award_date DATE DEFAULT NULL,
    status ENUM(
        'pending',
        'on_hold',
        'approved',
        'rejected'
    ) NOT NULL DEFAULT 'pending',
    percent_discount DECIMAL(5, 2) DEFAULT NULL, -- populated on approval for percent-type scholarships
    fixed_award DECIMAL(10, 2) DEFAULT NULL, -- populated on approval for fixed-type scholarships
    PRIMARY KEY (student_id, scholarship_id),
    approved_by INT DEFAULT NULL,
    CONSTRAINT chk_ss_one_type CHECK (
        NOT(
            percent_discount IS NOT NULL
            AND fixed_award IS NOT NULL
        )
    ),
    CONSTRAINT fk_ss_student FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ss_scholarship FOREIGN KEY (scholarship_id) REFERENCES scholarship (scholarship_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ss_approved_by FOREIGN KEY (approved_by) REFERENCES staff (staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 16. on_campus_job
-- --------------------------------------------------------
CREATE TABLE on_campus_job (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    positions_available INT NOT NULL DEFAULT 1,
    description TEXT,
    hourly_rate DECIMAL(6, 2) NOT NULL,
    availability_status ENUM('open', 'closed', 'filled') NOT NULL DEFAULT 'open',
    CONSTRAINT chk_pos CHECK (positions_available >= 0),
    CONSTRAINT chk_rate CHECK (hourly_rate >= 0)
);

-- --------------------------------------------------------
-- 17. payroll  (student campus employment pay records; job limit enforced by trigger)
-- --------------------------------------------------------
CREATE TABLE payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    hours_worked DECIMAL(6, 2) NOT NULL,
    gross_pay DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
    payment_date DATE DEFAULT NULL,
    CONSTRAINT chk_pay_period CHECK (period_end >= period_start),
    CONSTRAINT chk_pay_hours CHECK (hours_worked >= 0),
    CONSTRAINT chk_pay_gross CHECK (gross_pay >= 0),
    CONSTRAINT fk_pay_student FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pay_job FOREIGN KEY (job_id) REFERENCES on_campus_job (job_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 19. utility_bill
-- staff_id links each bill to the support staff member who manages it
-- --------------------------------------------------------
CREATE TABLE utility_bill (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT DEFAULT NULL,
    building_name VARCHAR(100) NOT NULL,
    building_type VARCHAR(50) NOT NULL,
    utility_type ENUM(
        'electricity',
        'water',
        'gas',
        'internet',
        'heating',
        'maintenance',
        'other'
    ) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    billing_month TINYINT NOT NULL,
    billing_year SMALLINT NOT NULL,
    payment_status ENUM('unpaid', 'paid', 'overdue') NOT NULL DEFAULT 'unpaid',
    CONSTRAINT chk_ub_amount CHECK (amount >= 0),
    CONSTRAINT chk_ub_month CHECK (
        billing_month BETWEEN 1 AND 12
    ),
    CONSTRAINT fk_ub_staff FOREIGN KEY (staff_id) REFERENCES support_staff (staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 20. misc_payment
-- staff_id links each payment to the support staff member who processed it
-- --------------------------------------------------------
CREATE TABLE misc_payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT DEFAULT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    item_name VARCHAR(150) DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_status ENUM('paid', 'pending') NOT NULL DEFAULT 'pending',
    CONSTRAINT chk_mp_amount CHECK (amount >= 0),
    CONSTRAINT fk_mp_staff FOREIGN KEY (staff_id) REFERENCES support_staff (staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 21. club
-- --------------------------------------------------------
CREATE TABLE club (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT DEFAULT NULL,
    club_name VARCHAR(150) NOT NULL,
    club_category VARCHAR(100) NOT NULL,
    allocated_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    spent_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    funding_source VARCHAR(100) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    approval_status ENUM(
        'pending',
        'approved',
        'rejected'
    ) NOT NULL DEFAULT 'pending',
    CONSTRAINT chk_club_alloc CHECK (allocated_amount >= 0),
    CONSTRAINT chk_club_spent CHECK (spent_amount >= 0),
    CONSTRAINT fk_club_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 22. tax_filing
-- --------------------------------------------------------
CREATE TABLE tax_filing (
    filing_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT DEFAULT NULL,
    fiscal_year SMALLINT NOT NULL,
    filing_date DATE DEFAULT NULL,
    filing_status ENUM('pending', 'filed', 'audited') NOT NULL DEFAULT 'pending',
    total_income DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_deductions DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    employee_compensation DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    capital_expenditures DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    research_credits DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    tax_liability DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT chk_tax_year CHECK (fiscal_year >= 2000),
    CONSTRAINT fk_tf_staff FOREIGN KEY (staff_id) REFERENCES support_staff (staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- 23. app_user  (plain-text password for demo; role-based login)
-- --------------------------------------------------------
CREATE TABLE app_user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role ENUM(
        'finance',
        'admin',
        'dean',
        'registrar',
        'student'
    ) NOT NULL,
    student_id INT DEFAULT NULL,
    staff_id INT DEFAULT NULL,
    CONSTRAINT fk_user_student FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_user_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);