-- =============================================================
-- UBMS — Seed Data
-- =============================================================
USE ubms;

-- ─── Departments ─────────────────────────────────────────────
INSERT INTO
    department (
        abr,
        dept_name,
        budget_allocation
    )
VALUES (
        'CS',
        'Computer Science',
        850000.00
    ),
    ('BUS', 'Business', 720000.00),
    (
        'ENG',
        'Engineering',
        920000.00
    ),
    (
        'MATH',
        'Mathematics',
        650000.00
    ),
    ('PHY', 'Physics', 780000.00);

-- ─── Staff ───────────────
INSERT INTO
    staff (
        staff_id,
        dept_abr,
        first_name,
        last_name,
        role,
        salary,
        hire_date,
        email,
        status,
        staff_type,
        reports_to
    )
VALUES
    -- Faculty
    (
        1,
        'CS',
        'Richard',
        'Palmer',
        'Department Head',
        135000.00,
        '2008-08-15',
        'r.palmer@univ.edu',
        'active',
        'faculty',
        NULL
    ),
    (
        2,
        'CS',
        'Susan',
        'Carter',
        'Professor',
        115000.00,
        '2010-01-10',
        's.carter@univ.edu',
        'active',
        'faculty',
        1
    ),
    (
        3,
        'CS',
        'Thomas',
        'Reed',
        'Professor',
        120000.00,
        '2009-06-20',
        't.reed@univ.edu',
        'active',
        'faculty',
        1
    ),
    (
        4,
        'BUS',
        'Linda',
        'Evans',
        'Department Head',
        130000.00,
        '2007-09-01',
        'l.evans@univ.edu',
        'active',
        'faculty',
        NULL
    ),
    (
        5,
        'BUS',
        'George',
        'Turner',
        'Professor',
        118000.00,
        '2011-03-15',
        'g.turner@univ.edu',
        'active',
        'faculty',
        4
    ),
    (
        6,
        'BUS',
        'Patricia',
        'Morgan',
        'Associate',
        105000.00,
        '2014-08-20',
        'p.morgan@univ.edu',
        'active',
        'faculty',
        4
    ),
    (
        7,
        'ENG',
        'Kenneth',
        'Bell',
        'Department Head',
        128000.00,
        '2006-01-15',
        'k.bell@univ.edu',
        'active',
        'faculty',
        NULL
    ),
    (
        8,
        'ENG',
        'Barbara',
        'Murphy',
        'Professor',
        122000.00,
        '2012-06-01',
        'b.murphy@univ.edu',
        'active',
        'faculty',
        7
    ),
    (
        9,
        'ENG',
        'Steven',
        'Bailey',
        'Associate',
        98000.00,
        '2015-08-15',
        's.bailey@univ.edu',
        'active',
        'faculty',
        7
    ),
    (
        10,
        'MATH',
        'Nancy',
        'Rivera',
        'Department Head',
        140000.00,
        '2005-01-20',
        'n.rivera@univ.edu',
        'active',
        'faculty',
        NULL
    ),
    (
        11,
        'MATH',
        'Mark',
        'Cooper',
        'Assistant',
        82000.00,
        '2020-08-15',
        'm.cooper@univ.edu',
        'active',
        'faculty',
        10
    ),
    (
        12,
        'MATH',
        'Karen',
        'Richardson',
        'Professor',
        125000.00,
        '2011-03-10',
        'k.richardson@univ.edu',
        'active',
        'faculty',
        10
    ),
    (
        13,
        'PHY',
        'Brian',
        'Cox',
        'Department Head',
        132000.00,
        '2008-08-20',
        'b.cox@univ.edu',
        'active',
        'faculty',
        NULL
    ),
    (
        14,
        'PHY',
        'Sharon',
        'Howard',
        'Assistant',
        80000.00,
        '2021-01-10',
        's.howard@univ.edu',
        'active',
        'faculty',
        13
    ),
    (
        15,
        'PHY',
        'Edward',
        'Ward',
        'Professor',
        145000.00,
        '2005-06-15',
        'e.ward@univ.edu',
        'active',
        'faculty',
        13
    ),
    -- Support staff 
    (
        16,
        'CS',
        'Carlos',
        'Mendez',
        'Finance Officer',
        52000.00,
        '2016-03-15',
        'c.mendez@univ.edu',
        'active',
        'support_staff',
        1
    ),
    (
        17,
        'CS',
        'Maria',
        'Lopez',
        'Admin Assistant',
        42000.00,
        '2017-07-20',
        'm.lopez@univ.edu',
        'active',
        'support_staff',
        1
    ),
    (
        18,
        'BUS',
        'Frank',
        'Russell',
        'Security',
        35000.00,
        '2019-01-10',
        'f.russell@univ.edu',
        'active',
        'support_staff',
        4
    ),
    (
        19,
        'BUS',
        'Lisa',
        'Stewart',
        'IT Support',
        48000.00,
        '2018-09-05',
        'l.stewart@univ.edu',
        'active',
        'support_staff',
        4
    ),
    (
        20,
        'ENG',
        'Robert',
        'Sanchez',
        'Janitor',
        31000.00,
        '2020-02-14',
        'r.sanchez@univ.edu',
        'active',
        'support_staff',
        7
    ),
    (
        21,
        'ENG',
        'Teresa',
        'Morris',
        'Finance Officer',
        54000.00,
        '2015-06-22',
        't.morris@univ.edu',
        'active',
        'support_staff',
        7
    ),
    (
        22,
        'MATH',
        'Wayne',
        'Rogers',
        'Security',
        34000.00,
        '2021-04-18',
        'w.rogers@univ.edu',
        'active',
        'support_staff',
        10
    ),
    (
        23,
        'MATH',
        'Gloria',
        'Cook',
        'Admin Assistant',
        44000.00,
        '2014-11-30',
        'g.cook@univ.edu',
        'active',
        'support_staff',
        10
    ),
    (
        24,
        'PHY',
        'Dennis',
        'Morgan',
        'IT Support',
        50000.00,
        '2019-08-25',
        'd.morgan@univ.edu',
        'active',
        'support_staff',
        13
    ),
    (
        25,
        'PHY',
        'Sandra',
        'Bell',
        'Janitor',
        30000.00,
        '2022-05-12',
        's.bell@univ.edu',
        'active',
        'support_staff',
        13
    ),
    (
        26,
        'CS',
        'Jerry',
        'Howard',
        'Lab Technician',
        46000.00,
        '2020-10-08',
        'j.howard@univ.edu',
        'active',
        'support_staff',
        1
    ),
    (
        27,
        'BUS',
        'Martha',
        'Ward',
        'Librarian',
        43000.00,
        '2018-02-19',
        'm.ward@univ.edu',
        'active',
        'support_staff',
        4
    ),
    (
        28,
        'ENG',
        'Philip',
        'Torres',
        'Finance Officer',
        53000.00,
        '2017-01-05',
        'p.torres@univ.edu',
        'active',
        'support_staff',
        7
    ),
    (
        29,
        'MATH',
        'Dorothy',
        'Peterson',
        'Admin Assistant',
        41000.00,
        '2019-09-14',
        'd.peterson@univ.edu',
        'active',
        'support_staff',
        10
    ),
    (
        30,
        'PHY',
        'Henry',
        'Gray',
        'Security',
        36000.00,
        '2021-12-01',
        'h.gray@univ.edu',
        'active',
        'support_staff',
        13
    );

-- ─── Faculty subtypes ────────────────────────────────────────
INSERT INTO
    faculty (staff_id, academic_rank)
VALUES (1, 'Professor'),
    (2, 'Professor'),
    (3, 'Professor'),
    (4, 'Professor'),
    (5, 'Professor'),
    (6, 'Associate Professor'),
    (7, 'Professor'),
    (8, 'Professor'),
    (9, 'Associate Professor'),
    (10, 'Professor'),
    (11, 'Assistant Professor'),
    (12, 'Professor'),
    (13, 'Professor'),
    (14, 'Assistant Professor'),
    (15, 'Professor');

-- ─── Support-staff subtypes ──────────────────────────────────
INSERT INTO
    support_staff (staff_id, category)
VALUES (16, 'finance'),
    (17, 'administrative'),
    (18, 'security'),
    (19, 'technical'),
    (20, 'maintenance'),
    (21, 'finance'),
    (22, 'security'),
    (23, 'administrative'),
    (24, 'technical'),
    (25, 'maintenance'),
    (26, 'technical'),
    (27, 'library'),
    (28, 'finance'),
    (29, 'administrative'),
    (30, 'security');

-- ─── Staff payments ─────────────────────────
INSERT INTO
    staff_payment (
        staff_id,
        month,
        year,
        gross_pay,
        deductions,
        net_pay,
        payment_date,
        payment_status
    )
VALUES
    -- January 2024
    (
        1,
        1,
        2024,
        11250.00,
        2812.50,
        8437.50,
        '2024-01-31',
        'paid'
    ),
    (
        2,
        1,
        2024,
        9583.33,
        2395.83,
        7187.50,
        '2024-01-31',
        'paid'
    ),
    (
        3,
        1,
        2024,
        10000.00,
        2500.00,
        7500.00,
        '2024-01-31',
        'paid'
    ),
    (
        4,
        1,
        2024,
        10833.33,
        2708.33,
        8125.00,
        '2024-01-31',
        'paid'
    ),
    (
        5,
        1,
        2024,
        9833.33,
        2458.33,
        7375.00,
        '2024-01-31',
        'paid'
    ),
    (
        6,
        1,
        2024,
        8750.00,
        2187.50,
        6562.50,
        '2024-01-31',
        'paid'
    ),
    (
        7,
        1,
        2024,
        10666.67,
        2666.67,
        8000.00,
        '2024-01-31',
        'paid'
    ),
    (
        8,
        1,
        2024,
        10166.67,
        2541.67,
        7625.00,
        '2024-01-31',
        'paid'
    ),
    (
        9,
        1,
        2024,
        8166.67,
        2041.67,
        6125.00,
        '2024-01-31',
        'paid'
    ),
    (
        10,
        1,
        2024,
        11666.67,
        2916.67,
        8750.00,
        '2024-01-31',
        'paid'
    ),
    (
        16,
        1,
        2024,
        4333.33,
        1083.33,
        3250.00,
        '2024-01-31',
        'paid'
    ),
    (
        17,
        1,
        2024,
        3500.00,
        875.00,
        2625.00,
        '2024-01-31',
        'paid'
    ),
    (
        18,
        1,
        2024,
        2916.67,
        729.17,
        2187.50,
        '2024-01-31',
        'paid'
    ),
    (
        19,
        1,
        2024,
        4000.00,
        1000.00,
        3000.00,
        '2024-01-31',
        'paid'
    ),
    (
        20,
        1,
        2024,
        2583.33,
        645.83,
        1937.50,
        '2024-01-31',
        'paid'
    ),
    -- February 2024
    (
        1,
        2,
        2024,
        11250.00,
        2812.50,
        8437.50,
        '2024-02-29',
        'paid'
    ),
    (
        2,
        2,
        2024,
        9583.33,
        2395.83,
        7187.50,
        '2024-02-29',
        'paid'
    ),
    (
        3,
        2,
        2024,
        10000.00,
        2500.00,
        7500.00,
        '2024-02-29',
        'paid'
    ),
    (
        4,
        2,
        2024,
        10833.33,
        2708.33,
        8125.00,
        '2024-02-29',
        'paid'
    ),
    (
        5,
        2,
        2024,
        9833.33,
        2458.33,
        7375.00,
        '2024-02-29',
        'paid'
    ),
    (
        11,
        2,
        2024,
        6833.33,
        1708.33,
        5125.00,
        '2024-02-29',
        'paid'
    ),
    (
        12,
        2,
        2024,
        10416.67,
        2604.17,
        7812.50,
        '2024-02-29',
        'paid'
    ),
    (
        13,
        2,
        2024,
        11000.00,
        2750.00,
        8250.00,
        '2024-02-29',
        'paid'
    ),
    (
        14,
        2,
        2024,
        6666.67,
        1666.67,
        5000.00,
        '2024-02-29',
        'paid'
    ),
    (
        15,
        2,
        2024,
        12083.33,
        3020.83,
        9062.50,
        '2024-02-29',
        'paid'
    ),
    (
        21,
        2,
        2024,
        4500.00,
        1125.00,
        3375.00,
        '2024-02-29',
        'paid'
    ),
    (
        22,
        2,
        2024,
        2833.33,
        708.33,
        2125.00,
        '2024-02-29',
        'paid'
    ),
    (
        23,
        2,
        2024,
        3666.67,
        916.67,
        2750.00,
        '2024-02-29',
        'paid'
    ),
    (
        24,
        2,
        2024,
        4166.67,
        1041.67,
        3125.00,
        '2024-02-29',
        'paid'
    ),
    (
        25,
        2,
        2024,
        2500.00,
        625.00,
        1875.00,
        '2024-02-29',
        'paid'
    );

-- ─── Programs (10) ───────────────────────────────────────────
INSERT INTO
    program (
        program_id,
        dept_abr,
        program_name,
        degree_level,
        duration_years,
        cost_per_credit
    )
VALUES (
        1,
        'CS',
        'BS Computer Science',
        'Bachelors',
        4,
        450.00
    ),
    (
        2,
        'CS',
        'MS Computer Science',
        'Masters',
        2,
        550.00
    ),
    (
        3,
        'BUS',
        'BBA Business Administration',
        'Bachelors',
        4,
        420.00
    ),
    (
        4,
        'BUS',
        'MBA Business Administration',
        'Masters',
        2,
        520.00
    ),
    (
        5,
        'ENG',
        'BS Mechanical Engineering',
        'Bachelors',
        4,
        470.00
    ),
    (
        6,
        'ENG',
        'MS Electrical Engineering',
        'Masters',
        2,
        570.00
    ),
    (
        7,
        'MATH',
        'BS Mathematics',
        'Bachelors',
        4,
        400.00
    ),
    (
        8,
        'MATH',
        'MS Applied Mathematics',
        'Masters',
        2,
        500.00
    ),
    (
        9,
        'PHY',
        'BS Physics',
        'Bachelors',
        4,
        430.00
    ),
    (
        10,
        'PHY',
        'MS Astrophysics',
        'Masters',
        2,
        530.00
    );

-- ─── Courses ────────────────────────────────────────────
INSERT INTO
    course (
        course_code,
        abr,
        course_id,
        course_name,
        credit_hours
    )
VALUES
    -- Computer Science
    (
        'CS101',
        'CS',
        101,
        'Introduction to Programming',
        4
    ),
    (
        'CS201',
        'CS',
        201,
        'Data Structures',
        3
    ),
    (
        'CS301',
        'CS',
        301,
        'Database Systems',
        3
    ),
    (
        'CS401',
        'CS',
        401,
        'Machine Learning',
        3
    ),
    (
        'CS402',
        'CS',
        402,
        'Cybersecurity',
        3
    ),
    (
        'CS302',
        'CS',
        302,
        'Web Development',
        3
    ),
    -- Business
    (
        'BUS101',
        'BUS',
        101,
        'Financial Accounting',
        3
    ),
    (
        'BUS201',
        'BUS',
        201,
        'Marketing Management',
        3
    ),
    (
        'BUS301',
        'BUS',
        301,
        'Business Analytics',
        3
    ),
    (
        'BUS401',
        'BUS',
        401,
        'Strategic Management',
        3
    ),
    (
        'BUS302',
        'BUS',
        302,
        'Entrepreneurship',
        3
    ),
    (
        'BUS402',
        'BUS',
        402,
        'Corporate Finance',
        3
    ),
    -- Engineering
    (
        'ENG101',
        'ENG',
        101,
        'Statics and Dynamics',
        4
    ),
    (
        'ENG201',
        'ENG',
        201,
        'Thermodynamics',
        3
    ),
    (
        'ENG301',
        'ENG',
        301,
        'Circuit Analysis',
        3
    ),
    (
        'ENG401',
        'ENG',
        401,
        'Robotics',
        3
    ),
    (
        'ENG302',
        'ENG',
        302,
        'CAD Design',
        3
    ),
    (
        'ENG402',
        'ENG',
        402,
        'Fluid Mechanics',
        3
    ),
    -- Mathematics
    (
        'MATH101',
        'MATH',
        101,
        'Calculus',
        4
    ),
    (
        'MATH201',
        'MATH',
        201,
        'Linear Algebra',
        3
    ),
    (
        'MATH301',
        'MATH',
        301,
        'Differential Equations',
        3
    ),
    (
        'MATH401',
        'MATH',
        401,
        'Statistics',
        3
    ),
    (
        'MATH302',
        'MATH',
        302,
        'Number Theory',
        3
    ),
    (
        'MATH402',
        'MATH',
        402,
        'Real Analysis',
        3
    ),
    -- Physics
    (
        'PHY101',
        'PHY',
        101,
        'General Physics I',
        4
    ),
    (
        'PHY201',
        'PHY',
        201,
        'Electromagnetism',
        3
    ),
    (
        'PHY301',
        'PHY',
        301,
        'Quantum Mechanics',
        3
    ),
    (
        'PHY401',
        'PHY',
        401,
        'Astrophysics',
        3
    ),
    (
        'PHY302',
        'PHY',
        302,
        'Optics',
        3
    ),
    (
        'PHY402',
        'PHY',
        402,
        'Nuclear Physics',
        3
    );

-- ─── Program-Course mappings ──────────────────────────────────
INSERT INTO
    program_course (program_id, course_code)
VALUES
    -- BS CS
    (1, 'CS101'),
    (1, 'CS201'),
    (1, 'CS301'),
    (1, 'CS402'),
    (1, 'CS302'),
    -- MS CS
    (2, 'CS301'),
    (2, 'CS401'),
    (2, 'CS402'),
    -- BBA
    (3, 'BUS101'),
    (3, 'BUS201'),
    (3, 'BUS301'),
    (3, 'BUS302'),
    -- MBA
    (4, 'BUS301'),
    (4, 'BUS401'),
    (4, 'BUS402'),
    -- BS Mechanical Engineering
    (5, 'ENG101'),
    (5, 'ENG201'),
    (5, 'ENG302'),
    (5, 'ENG402'),
    -- MS Electrical Engineering
    (6, 'ENG301'),
    (6, 'ENG401'),
    (6, 'ENG402'),
    -- BS Mathematics
    (7, 'MATH101'),
    (7, 'MATH201'),
    (7, 'MATH301'),
    -- MS Applied Mathematics
    (8, 'MATH401'),
    (8, 'MATH302'),
    (8, 'MATH402'),
    -- BS Physics 
    (9, 'PHY101'),
    (9, 'PHY201'),
    (9, 'PHY301'),
    (9, 'PHY401'),
    (9, 'PHY302'),
    (9, 'PHY402'),
    -- MS Astrophysics
    (10, 'PHY301'),
    (10, 'PHY401'),
    (10, 'PHY302'),
    (10, 'PHY402');

-- ─── Semesters ───────────────────────────────────────────────
INSERT INTO
    semester (semester_name, year)
VALUES ('Fall', 2023),
    ('Spring', 2024),
    ('Summer', 2024),
    ('Fall', 2024),
    ('Spring', 2025),
    ('Summer', 2025);

-- ─── Students ───────────────────────────────────────────
INSERT INTO
    student (
        student_id,
        program_id,
        first_name,
        last_name,
        email,
        enrollment_year,
        status
    )
VALUES (
        1,
        1,
        'John',
        'Smith',
        'john.smith@univ.edu',
        2021,
        'active'
    ),
    (
        2,
        1,
        'Emily',
        'Johnson',
        'emily.j@univ.edu',
        2022,
        'active'
    ),
    (
        3,
        2,
        'Michael',
        'Williams',
        'm.williams@univ.edu',
        2023,
        'active'
    ),
    (
        4,
        3,
        'Sarah',
        'Brown',
        's.brown@univ.edu',
        2021,
        'active'
    ),
    (
        5,
        3,
        'David',
        'Jones',
        'd.jones@univ.edu',
        2022,
        'active'
    ),
    (
        6,
        4,
        'Jessica',
        'Davis',
        'j.davis@univ.edu',
        2023,
        'active'
    ),
    (
        7,
        5,
        'Daniel',
        'Miller',
        'd.miller@univ.edu',
        2021,
        'active'
    ),
    (
        8,
        5,
        'Ashley',
        'Wilson',
        'a.wilson@univ.edu',
        2022,
        'active'
    ),
    (
        9,
        6,
        'James',
        'Moore',
        'j.moore@univ.edu',
        2023,
        'active'
    ),
    (
        10,
        7,
        'Lauren',
        'Taylor',
        'l.taylor@univ.edu',
        2021,
        'active'
    ),
    (
        11,
        7,
        'Robert',
        'Anderson',
        'r.anderson@univ.edu',
        2022,
        'active'
    ),
    (
        12,
        8,
        'Megan',
        'Thomas',
        'm.thomas@univ.edu',
        2023,
        'active'
    ),
    (
        13,
        9,
        'William',
        'Jackson',
        'w.jackson@univ.edu',
        2021,
        'active'
    ),
    (
        14,
        9,
        'Hannah',
        'White',
        'h.white@univ.edu',
        2022,
        'active'
    ),
    (
        15,
        10,
        'Christopher',
        'Harris',
        'c.harris@univ.edu',
        2023,
        'active'
    ),
    (
        16,
        1,
        'Samantha',
        'Martin',
        's.martin@univ.edu',
        2020,
        'alumni'
    ),
    (
        17,
        2,
        'Andrew',
        'Garcia',
        'a.garcia@univ.edu',
        2021,
        'active'
    ),
    (
        18,
        3,
        'Rachel',
        'Martinez',
        'r.martinez@univ.edu',
        2020,
        'alumni'
    ),
    (
        19,
        4,
        'Joshua',
        'Robinson',
        'j.robinson@univ.edu',
        2022,
        'active'
    ),
    (
        20,
        5,
        'Nicole',
        'Clark',
        'n.clark@univ.edu',
        2021,
        'suspended'
    ),
    (
        21,
        6,
        'Ryan',
        'Rodriguez',
        'r.rodriguez@univ.edu',
        2022,
        'active'
    ),
    (
        22,
        7,
        'Stephanie',
        'Lewis',
        's.lewis@univ.edu',
        2023,
        'active'
    ),
    (
        23,
        8,
        'Brandon',
        'Lee',
        'b.lee@univ.edu',
        2021,
        'active'
    ),
    (
        24,
        9,
        'Amanda',
        'Walker',
        'a.walker@univ.edu',
        2020,
        'alumni'
    ),
    (
        25,
        10,
        'Tyler',
        'Hall',
        't.hall@univ.edu',
        2022,
        'active'
    ),
    (
        26,
        1,
        'Kayla',
        'Allen',
        'k.allen@univ.edu',
        2023,
        'active'
    ),
    (
        27,
        3,
        'Nathan',
        'Young',
        'n.young@univ.edu',
        2021,
        'active'
    ),
    (
        28,
        5,
        'Brittany',
        'King',
        'b.king@univ.edu',
        2022,
        'active'
    ),
    (
        29,
        7,
        'Justin',
        'Wright',
        'j.wright@univ.edu',
        2020,
        'alumni'
    ),
    (
        30,
        9,
        'Victoria',
        'Scott',
        'v.scott@univ.edu',
        2023,
        'active'
    );

-- ─── Scholarships ───────────────────────────────────────
INSERT INTO
    scholarship (
        scholarship_id,
        scholarship_name,
        scholarship_type,
        percent_coverage,
        fixed_amount,
        total_amount,
        eligibility_criteria,
        created_by
    )
VALUES (
        1,
        'Merit Scholarship',
        'percent',
        50.00,
        0.00,
        50000.00,
        'GPA >= 3.5 and full-time enrollment',
        1
    ),
    (
        2,
        'Engineering Excellence Award',
        'percent',
        40.00,
        0.00,
        40000.00,
        'Enrolled in Engineering or Physics program',
        7
    ),
    (
        3,
        'Business Leadership Grant',
        'percent',
        30.00,
        0.00,
        30000.00,
        'Enrolled in Business program, GPA >= 3.0',
        4
    ),
    (
        4,
        'STEM Innovator Fellowship',
        'percent',
        60.00,
        0.00,
        60000.00,
        'STEM program enrollment, research interest',
        1
    ),
    (
        5,
        'Mathematics Achievement Award',
        'percent',
        45.00,
        0.00,
        45000.00,
        'Mathematics program, GPA >= 3.5',
        10
    ),
    (
        6,
        'Physics Pioneer Grant',
        'fixed',
        0.00,
        3500.00,
        35000.00,
        'Physics or Astrophysics program — one-time $3,500 award',
        13
    ),
    (
        7,
        'Computer Science Scholarship',
        'percent',
        50.00,
        0.00,
        50000.00,
        'CS program, demonstrated coding skills',
        1
    ),
    (
        8,
        'Applied Science Award',
        'fixed',
        0.00,
        4000.00,
        40000.00,
        'Applied Mathematics or Science program — one-time $4,000 award',
        10
    ),
    (
        9,
        'Graduate Excellence Fellowship',
        'percent',
        55.00,
        0.00,
        55000.00,
        'Graduate program, GPA >= 3.7',
        4
    ),
    (
        10,
        'Dean''s Academic Award',
        'percent',
        70.00,
        0.00,
        70000.00,
        'Top 5% academic performance, any program',
        7
    );

-- ─── Student scholarships  ─────────────────────
INSERT INTO
    student_scholarship (
        student_id,
        scholarship_id,
        award_date,
        status,
        percent_discount,
        fixed_award,
        approved_by
    )
VALUES (
        1,
        1,
        '2023-09-01',
        'approved',
        50.00,
        NULL,
        1
    ),
    (
        1,
        4,
        '2024-01-15',
        'approved',
        60.00,
        NULL,
        1
    ),
    (
        2,
        1,
        '2024-09-01',
        'approved',
        50.00,
        NULL,
        1
    ),
    (
        3,
        4,
        '2024-09-01',
        'approved',
        60.00,
        NULL,
        1
    ),
    (
        4,
        3,
        '2023-09-01',
        'approved',
        30.00,
        NULL,
        4
    ),
    (
        5,
        3,
        '2024-09-01',
        'approved',
        30.00,
        NULL,
        4
    ),
    (
        5,
        7,
        '2024-09-15',
        'approved',
        50.00,
        NULL,
        1
    ),
    (
        6,
        3,
        '2024-09-01',
        'approved',
        30.00,
        NULL,
        4
    ),
    (
        7,
        2,
        '2023-09-01',
        'approved',
        40.00,
        NULL,
        7
    ),
    (
        7,
        5,
        '2023-09-15',
        'approved',
        45.00,
        NULL,
        10
    ),
    (
        8,
        2,
        '2024-09-01',
        'approved',
        40.00,
        NULL,
        7
    ),
    (
        8,
        6,
        '2024-09-15',
        'approved',
        NULL,
        3500.00,
        13
    ),
    (
        9,
        2,
        '2024-09-01',
        'approved',
        40.00,
        NULL,
        7
    ),
    (
        10,
        10,
        '2023-09-01',
        'approved',
        70.00,
        NULL,
        7
    ),
    (
        11,
        5,
        '2024-09-01',
        'approved',
        45.00,
        NULL,
        10
    ),
    (
        12,
        8,
        '2024-09-01',
        'approved',
        NULL,
        4000.00,
        10
    ),
    (
        13,
        6,
        '2023-09-01',
        'approved',
        NULL,
        3500.00,
        13
    ),
    (
        14,
        9,
        '2024-09-01',
        'approved',
        55.00,
        NULL,
        4
    ),
    (
        15,
        4,
        '2024-09-01',
        'approved',
        60.00,
        NULL,
        1
    ),
    (
        17,
        4,
        '2024-01-15',
        'approved',
        60.00,
        NULL,
        1
    ),
    (
        19,
        3,
        '2024-09-01',
        'approved',
        30.00,
        NULL,
        4
    ),
    (
        21,
        2,
        '2024-09-01',
        'approved',
        40.00,
        NULL,
        7
    ),
    (
        22,
        5,
        '2024-09-01',
        'approved',
        45.00,
        NULL,
        10
    ),
    (
        23,
        8,
        '2023-09-01',
        'approved',
        NULL,
        4000.00,
        10
    ),
    (
        25,
        9,
        '2024-09-01',
        'approved',
        55.00,
        NULL,
        4
    ),
    (
        26,
        1,
        '2024-09-01',
        'approved',
        50.00,
        NULL,
        1
    ),
    (
        27,
        7,
        '2023-09-01',
        'approved',
        50.00,
        NULL,
        1
    ),
    (
        28,
        6,
        '2024-09-01',
        'approved',
        NULL,
        3500.00,
        13
    ),
    (
        29,
        10,
        '2023-09-01',
        'approved',
        70.00,
        NULL,
        7
    ),
    (
        30,
        9,
        '2024-09-01',
        'approved',
        55.00,
        NULL,
        4
    );

-- Deduct fixed awards from scholarship pools (mirrors what sp_approve_scholarship does)
UPDATE scholarship
SET
    total_amount = 24500.00
WHERE
    scholarship_id = 6;

UPDATE scholarship
SET
    total_amount = 28000.00
WHERE
    scholarship_id = 8;

-- ─── Course registrations ─────────────────────────────────────
INSERT INTO
    course_registration (
        student_id,
        course_code,
        semester_name,
        year
    )
VALUES (1, 'CS101', 'Fall', 2023),
    (1, 'CS201', 'Fall', 2023),
    (4, 'BUS101', 'Fall', 2023),
    (4, 'BUS201', 'Fall', 2023),
    (7, 'ENG101', 'Fall', 2023),
    (7, 'ENG201', 'Fall', 2023),
    (10, 'MATH101', 'Fall', 2023),
    (10, 'MATH201', 'Fall', 2023),
    (13, 'PHY101', 'Fall', 2023),
    (13, 'PHY201', 'Fall', 2023);

-- Spring 2024
INSERT INTO
    course_registration (
        student_id,
        course_code,
        semester_name,
        year
    )
VALUES (1, 'CS301', 'Spring', 2024);

-- Fall 2024
INSERT INTO
    course_registration (
        student_id,
        course_code,
        semester_name,
        year
    )
VALUES (2, 'CS101', 'Fall', 2024),
    (2, 'CS201', 'Fall', 2024),
    (3, 'CS401', 'Fall', 2024),
    (3, 'CS402', 'Fall', 2024),
    (5, 'BUS101', 'Fall', 2024),
    (5, 'BUS301', 'Fall', 2024),
    (6, 'BUS401', 'Fall', 2024),
    (6, 'BUS402', 'Fall', 2024),
    (8, 'ENG101', 'Fall', 2024),
    (8, 'ENG302', 'Fall', 2024),
    (9, 'ENG301', 'Fall', 2024),
    (9, 'ENG401', 'Fall', 2024),
    (11, 'MATH101', 'Fall', 2024),
    (11, 'MATH301', 'Fall', 2024),
    (12, 'MATH401', 'Fall', 2024),
    (12, 'MATH302', 'Fall', 2024),
    (14, 'PHY101', 'Fall', 2024),
    (14, 'PHY301', 'Fall', 2024),
    (15, 'PHY401', 'Fall', 2024);

-- ─── Update tuition payment details ──────────────────────────
UPDATE tuition_fee
SET
    payment_status = 'paid',
    payment_method = 'online',
    payment_date = '2023-09-12'
WHERE
    student_id = 1
    AND semester_name = 'Fall'
    AND year = 2023;

UPDATE tuition_fee
SET
    payment_status = 'paid',
    payment_method = 'cash',
    payment_date = '2023-09-11'
WHERE
    student_id = 4
    AND semester_name = 'Fall'
    AND year = 2023;

UPDATE tuition_fee
SET
    payment_status = 'paid',
    payment_method = 'cheque',
    payment_date = '2023-09-12'
WHERE
    student_id = 7
    AND semester_name = 'Fall'
    AND year = 2023;

UPDATE tuition_fee
SET
    payment_status = 'paid',
    payment_method = 'online',
    payment_date = '2023-09-11'
WHERE
    student_id = 10
    AND semester_name = 'Fall'
    AND year = 2023;

UPDATE tuition_fee
SET
    payment_status = 'paid',
    payment_method = 'online',
    payment_date = '2023-09-10'
WHERE
    student_id = 13
    AND semester_name = 'Fall'
    AND year = 2023;
-- Spring 2024
UPDATE tuition_fee
SET
    payment_status = 'paid',
    payment_method = 'online',
    payment_date = '2024-01-18'
WHERE
    student_id = 1
    AND semester_name = 'Spring'
    AND year = 2024;
-- Fall 2024
UPDATE tuition_fee
SET
    payment_status = 'paid',
    payment_method = 'online',
    payment_date = '2024-09-12'
WHERE
    student_id = 2
    AND semester_name = 'Fall'
    AND year = 2024;

UPDATE tuition_fee
SET
    payment_status = 'unpaid',
    payment_method = 'online'
WHERE
    student_id = 3
    AND semester_name = 'Fall'
    AND year = 2024;

UPDATE tuition_fee
SET
    payment_status = 'unpaid',
    payment_method = 'online'
WHERE
    student_id = 5
    AND semester_name = 'Fall'
    AND year = 2024;

UPDATE tuition_fee
SET
    payment_status = 'overdue',
    payment_method = 'online'
WHERE
    student_id = 6
    AND semester_name = 'Fall'
    AND year = 2024;

UPDATE tuition_fee
SET
    payment_status = 'unpaid',
    payment_method = 'online'
WHERE
    student_id = 8
    AND semester_name = 'Fall'
    AND year = 2024;

UPDATE tuition_fee
SET
    payment_status = 'unpaid',
    payment_method = 'cheque'
WHERE
    student_id = 9
    AND semester_name = 'Fall'
    AND year = 2024;

UPDATE tuition_fee
SET
    payment_status = 'overdue',
    payment_method = 'online'
WHERE
    student_id = 11
    AND semester_name = 'Fall'
    AND year = 2024;

UPDATE tuition_fee
SET
    payment_status = 'paid',
    payment_method = 'online',
    payment_date = '2024-09-14'
WHERE
    student_id = 12
    AND semester_name = 'Fall'
    AND year = 2024;

UPDATE tuition_fee
SET
    payment_status = 'overdue',
    payment_method = 'online'
WHERE
    student_id = 14
    AND semester_name = 'Fall'
    AND year = 2024;

UPDATE tuition_fee
SET
    payment_status = 'paid',
    payment_method = 'online',
    payment_date = '2024-09-10'
WHERE
    student_id = 15
    AND semester_name = 'Fall'
    AND year = 2024;

-- ─── On-campus jobs  ─────────────────────────────────────
INSERT INTO
    on_campus_job (
        job_id,
        title,
        positions_available,
        description,
        hourly_rate,
        availability_status
    )
VALUES (
        1,
        'Library Assistant',
        5,
        'Assist with book shelving and front desk operations',
        14.00,
        'open'
    ),
    (
        2,
        'Lab Technician',
        3,
        'Maintain and prepare lab equipment for classes',
        16.50,
        'open'
    ),
    (
        3,
        'IT Help Desk',
        4,
        'Provide technical support to students and staff',
        17.00,
        'open'
    ),
    (
        4,
        'Tutoring Center Aide',
        6,
        'Tutor students in various subjects',
        15.00,
        'open'
    ),
    (
        5,
        'Campus Tour Guide',
        3,
        'Lead campus tours for prospective students',
        13.50,
        'open'
    ),
    (
        6,
        'Research Assistant',
        4,
        'Assist faculty with ongoing research projects',
        18.00,
        'open'
    ),
    (
        7,
        'Cafeteria Worker',
        8,
        'Prepare and serve food in campus dining',
        12.50,
        'open'
    ),
    (
        8,
        'Fitness Center Attendant',
        3,
        'Monitor gym equipment and assist members',
        13.00,
        'open'
    ),
    (
        9,
        'Administrative Aide',
        4,
        'Assist with office tasks and data entry',
        14.50,
        'open'
    ),
    (
        10,
        'Event Coordinator',
        2,
        'Help organize campus events and activities',
        15.50,
        'closed'
    );

-- ─── Payroll  ─────────────────────────────────────
INSERT INTO
    payroll (
        payroll_id,
        student_id,
        job_id,
        period_start,
        period_end,
        hours_worked,
        gross_pay,
        payment_status,
        payment_date
    )
VALUES (
        1,
        1,
        3,
        '2023-09-01',
        '2023-09-30',
        40.00,
        680.00,
        'paid',
        '2023-10-05'
    ),
    (
        2,
        1,
        3,
        '2023-10-01',
        '2023-10-31',
        38.00,
        646.00,
        'paid',
        '2023-11-05'
    ),
    (
        3,
        2,
        1,
        '2024-09-01',
        '2024-09-30',
        35.00,
        490.00,
        'paid',
        '2024-10-05'
    ),
    (
        4,
        2,
        1,
        '2024-10-01',
        '2024-10-31',
        40.00,
        560.00,
        'paid',
        '2024-11-05'
    ),
    (
        5,
        3,
        6,
        '2024-09-01',
        '2024-09-30',
        30.00,
        540.00,
        'paid',
        '2024-10-05'
    ),
    (
        6,
        4,
        4,
        '2023-09-01',
        '2023-09-30',
        32.00,
        480.00,
        'paid',
        '2023-10-05'
    ),
    (
        7,
        4,
        4,
        '2023-10-01',
        '2023-10-31',
        36.00,
        540.00,
        'paid',
        '2023-11-05'
    ),
    (
        8,
        5,
        7,
        '2024-09-01',
        '2024-09-30',
        45.00,
        562.50,
        'paid',
        '2024-10-05'
    ),
    (
        9,
        7,
        2,
        '2023-09-01',
        '2023-09-30',
        28.00,
        462.00,
        'paid',
        '2023-10-05'
    ),
    (
        10,
        7,
        2,
        '2023-10-01',
        '2023-10-31',
        32.00,
        528.00,
        'paid',
        '2023-11-05'
    ),
    (
        11,
        8,
        5,
        '2024-09-01',
        '2024-09-30',
        20.00,
        270.00,
        'paid',
        '2024-10-05'
    ),
    (
        12,
        10,
        4,
        '2023-09-01',
        '2023-09-30',
        30.00,
        450.00,
        'paid',
        '2023-10-05'
    ),
    (
        13,
        10,
        4,
        '2023-10-01',
        '2023-10-31',
        28.00,
        420.00,
        'paid',
        '2023-11-05'
    ),
    (
        14,
        11,
        1,
        '2024-09-01',
        '2024-09-30',
        35.00,
        490.00,
        'paid',
        '2024-10-05'
    ),
    (
        15,
        13,
        8,
        '2023-09-01',
        '2023-09-30',
        24.00,
        312.00,
        'paid',
        '2023-10-05'
    ),
    (
        16,
        13,
        8,
        '2023-10-01',
        '2023-10-31',
        28.00,
        364.00,
        'paid',
        '2023-11-05'
    ),
    (
        17,
        14,
        9,
        '2024-09-01',
        '2024-09-30',
        30.00,
        435.00,
        'paid',
        '2024-10-05'
    ),
    (
        18,
        17,
        6,
        '2024-09-01',
        '2024-09-30',
        25.00,
        450.00,
        'paid',
        '2024-10-05'
    ),
    (
        19,
        19,
        9,
        '2024-09-01',
        '2024-09-30',
        32.00,
        464.00,
        'paid',
        '2024-10-05'
    ),
    (
        20,
        21,
        2,
        '2024-09-01',
        '2024-09-30',
        28.00,
        462.00,
        'paid',
        '2024-10-05'
    ),
    (
        21,
        22,
        1,
        '2024-09-01',
        '2024-09-30',
        30.00,
        420.00,
        'paid',
        '2024-10-05'
    ),
    (
        22,
        26,
        3,
        '2024-09-01',
        '2024-09-30',
        35.00,
        595.00,
        'paid',
        '2024-10-05'
    ),
    (
        23,
        27,
        7,
        '2023-09-01',
        '2023-09-30',
        40.00,
        500.00,
        'paid',
        '2023-10-05'
    ),
    (
        24,
        28,
        5,
        '2024-09-01',
        '2024-09-30',
        20.00,
        270.00,
        'paid',
        '2024-10-05'
    ),
    (
        25,
        30,
        4,
        '2024-09-01',
        '2024-09-30',
        25.00,
        375.00,
        'paid',
        '2024-10-05'
    ),
    (
        26,
        1,
        3,
        '2024-01-01',
        '2024-01-31',
        36.00,
        612.00,
        'paid',
        '2024-02-05'
    ),
    (
        27,
        7,
        2,
        '2024-01-01',
        '2024-01-31',
        30.00,
        495.00,
        'paid',
        '2024-02-05'
    ),
    (
        28,
        10,
        4,
        '2024-01-01',
        '2024-01-31',
        32.00,
        480.00,
        'paid',
        '2024-02-05'
    ),
    (
        29,
        13,
        8,
        '2024-01-01',
        '2024-01-31',
        26.00,
        338.00,
        'paid',
        '2024-02-05'
    ),
    (
        30,
        5,
        7,
        '2024-10-01',
        '2024-10-31',
        42.00,
        525.00,
        'pending',
        NULL
    );

-- ─── Utility bills ──────────────────────────────
INSERT INTO
    utility_bill (
        bill_id,
        building_name,
        building_type,
        utility_type,
        amount,
        billing_month,
        billing_year,
        payment_status
    )
VALUES (
        1,
        'Science Hall',
        'academic',
        'electricity',
        12500.00,
        1,
        2024,
        'paid'
    ),
    (
        2,
        'Science Hall',
        'academic',
        'water',
        3200.00,
        1,
        2024,
        'paid'
    ),
    (
        3,
        'Business Center',
        'academic',
        'electricity',
        11800.00,
        1,
        2024,
        'paid'
    ),
    (
        4,
        'Business Center',
        'academic',
        'internet',
        8500.00,
        1,
        2024,
        'paid'
    ),
    (
        5,
        'Engineering Block',
        'academic',
        'electricity',
        14500.00,
        1,
        2024,
        'paid'
    ),
    (
        6,
        'Engineering Block',
        'academic',
        'gas',
        4200.00,
        1,
        2024,
        'paid'
    ),
    (
        7,
        'Admin Building',
        'administrative',
        'electricity',
        9800.00,
        1,
        2024,
        'paid'
    ),
    (
        8,
        'Admin Building',
        'administrative',
        'water',
        2800.00,
        1,
        2024,
        'paid'
    ),
    (
        9,
        'Student Dorm A',
        'residential',
        'electricity',
        8500.00,
        1,
        2024,
        'paid'
    ),
    (
        10,
        'Student Dorm A',
        'residential',
        'water',
        4100.00,
        1,
        2024,
        'paid'
    ),
    (
        11,
        'Sports Complex',
        'recreational',
        'electricity',
        6500.00,
        1,
        2024,
        'paid'
    ),
    (
        12,
        'Sports Complex',
        'recreational',
        'water',
        2200.00,
        1,
        2024,
        'paid'
    ),
    (
        13,
        'Science Hall',
        'academic',
        'electricity',
        13200.00,
        2,
        2024,
        'paid'
    ),
    (
        14,
        'Science Hall',
        'academic',
        'water',
        3500.00,
        2,
        2024,
        'paid'
    ),
    (
        15,
        'Business Center',
        'academic',
        'electricity',
        12100.00,
        2,
        2024,
        'paid'
    ),
    (
        16,
        'Business Center',
        'academic',
        'internet',
        8500.00,
        2,
        2024,
        'paid'
    ),
    (
        17,
        'Engineering Block',
        'academic',
        'electricity',
        15200.00,
        2,
        2024,
        'paid'
    ),
    (
        18,
        'Engineering Block',
        'academic',
        'gas',
        3800.00,
        2,
        2024,
        'paid'
    ),
    (
        19,
        'Admin Building',
        'administrative',
        'electricity',
        10200.00,
        2,
        2024,
        'paid'
    ),
    (
        20,
        'Student Dorm A',
        'residential',
        'electricity',
        9200.00,
        2,
        2024,
        'unpaid'
    ),
    (
        21,
        'Student Dorm A',
        'residential',
        'water',
        4500.00,
        2,
        2024,
        'unpaid'
    ),
    (
        22,
        'Sports Complex',
        'recreational',
        'electricity',
        7200.00,
        2,
        2024,
        'paid'
    ),
    (
        23,
        'Science Hall',
        'academic',
        'electricity',
        14800.00,
        3,
        2024,
        'paid'
    ),
    (
        24,
        'Science Hall',
        'academic',
        'maintenance',
        6500.00,
        3,
        2024,
        'paid'
    ),
    (
        25,
        'Business Center',
        'academic',
        'electricity',
        12800.00,
        3,
        2024,
        'overdue'
    ),
    (
        26,
        'Engineering Block',
        'academic',
        'electricity',
        16000.00,
        3,
        2024,
        'paid'
    ),
    (
        27,
        'Engineering Block',
        'academic',
        'internet',
        9000.00,
        3,
        2024,
        'unpaid'
    ),
    (
        28,
        'Admin Building',
        'administrative',
        'maintenance',
        8500.00,
        3,
        2024,
        'paid'
    ),
    (
        29,
        'Student Dorm A',
        'residential',
        'electricity',
        7800.00,
        3,
        2024,
        'overdue'
    ),
    (
        30,
        'Sports Complex',
        'recreational',
        'maintenance',
        5500.00,
        3,
        2024,
        'paid'
    );

-- ─── Misc payments ──────────────────────────────
INSERT INTO
    misc_payment (
        payment_id,
        description,
        category,
        amount,
        payment_date,
        payment_status
    )
VALUES (
        1,
        'Office supplies for CS department',
        'supplies',
        1200.00,
        '2024-01-15',
        'paid'
    ),
    (
        2,
        'Printer maintenance contract',
        'maintenance',
        3500.00,
        '2024-01-20',
        'paid'
    ),
    (
        3,
        'New desks for Business Center',
        'furniture',
        8500.00,
        '2024-02-01',
        'paid'
    ),
    (
        4,
        'Annual software licenses',
        'software',
        12000.00,
        '2024-02-15',
        'paid'
    ),
    (
        5,
        'Lab equipment replacement',
        'equipment',
        15000.00,
        '2024-01-25',
        'paid'
    ),
    (
        6,
        'Safety inspection fees',
        'inspection',
        2500.00,
        '2024-02-10',
        'paid'
    ),
    (
        7,
        'Campus WiFi upgrade',
        'technology',
        25000.00,
        '2024-03-01',
        'paid'
    ),
    (
        8,
        'Graduation ceremony supplies',
        'events',
        5500.00,
        '2024-03-15',
        'paid'
    ),
    (
        9,
        'Marketing materials for open house',
        'marketing',
        3200.00,
        '2024-02-20',
        'paid'
    ),
    (
        10,
        'Library book purchases',
        'supplies',
        7800.00,
        '2024-03-10',
        'paid'
    ),
    (
        11,
        'Fire extinguisher replacement',
        'safety',
        1800.00,
        '2024-01-30',
        'paid'
    ),
    (
        12,
        'Parking lot repaving',
        'maintenance',
        18000.00,
        '2024-03-20',
        'pending'
    ),
    (
        13,
        'Student ID card printing',
        'supplies',
        2200.00,
        '2024-04-01',
        'paid'
    ),
    (
        14,
        'Conference room AV upgrade',
        'technology',
        9500.00,
        '2024-04-10',
        'paid'
    ),
    (
        15,
        'Landscaping services',
        'maintenance',
        4500.00,
        '2024-04-15',
        'paid'
    ),
    (
        16,
        'Pest control annual contract',
        'maintenance',
        3000.00,
        '2024-04-20',
        'paid'
    ),
    (
        17,
        'Emergency generator repair',
        'equipment',
        7500.00,
        '2024-04-05',
        'paid'
    ),
    (
        18,
        'Window cleaning services',
        'maintenance',
        2800.00,
        '2024-04-25',
        'paid'
    ),
    (
        19,
        'Faculty retreat expenses',
        'events',
        6000.00,
        '2024-05-01',
        'pending'
    ),
    (
        20,
        'Research journal subscriptions',
        'software',
        8000.00,
        '2024-05-10',
        'paid'
    ),
    (
        21,
        'Cafeteria equipment upgrade',
        'equipment',
        11000.00,
        '2024-05-15',
        'pending'
    ),
    (
        22,
        'Handicap ramp installation',
        'construction',
        14000.00,
        '2024-05-20',
        'paid'
    ),
    (
        23,
        'Sports equipment purchase',
        'equipment',
        9000.00,
        '2024-05-05',
        'paid'
    ),
    (
        24,
        'HVAC filter replacement',
        'maintenance',
        3500.00,
        '2024-05-25',
        'paid'
    ),
    (
        25,
        'Commencement speaker fee',
        'events',
        5000.00,
        '2024-06-01',
        'paid'
    ),
    (
        26,
        'Server room cooling upgrade',
        'technology',
        12500.00,
        '2024-06-10',
        'pending'
    ),
    (
        27,
        'Office chair replacement',
        'furniture',
        4200.00,
        '2024-06-15',
        'paid'
    ),
    (
        28,
        'Security camera installation',
        'security',
        8500.00,
        '2024-06-20',
        'paid'
    ),
    (
        29,
        'Chemistry lab renovation',
        'construction',
        22000.00,
        '2024-06-05',
        'pending'
    ),
    (
        30,
        'Annual insurance premium',
        'insurance',
        15000.00,
        '2024-06-25',
        'paid'
    );

-- ─── Clubs ──────────────────────────────────────────────
INSERT INTO
    club (
        club_id,
        staff_id,
        club_name,
        club_category,
        allocated_amount,
        spent_amount,
        funding_source,
        academic_year,
        approval_status
    )
VALUES (
        1,
        1,
        'Coding Club',
        'academic',
        5000.00,
        3200.00,
        'Department Fund',
        '2023-2024',
        'approved'
    ),
    (
        2,
        1,
        'Cybersecurity Team',
        'academic',
        4500.00,
        4100.00,
        'Department Fund',
        '2023-2024',
        'approved'
    ),
    (
        3,
        4,
        'Business Society',
        'academic',
        4000.00,
        2800.00,
        'Department Fund',
        '2023-2024',
        'approved'
    ),
    (
        4,
        4,
        'Entrepreneurship Cell',
        'academic',
        3500.00,
        3500.00,
        'Department Fund',
        '2023-2024',
        'approved'
    ),
    (
        5,
        7,
        'Robotics Club',
        'technical',
        6000.00,
        5200.00,
        'University Fund',
        '2023-2024',
        'approved'
    ),
    (
        6,
        7,
        'Drone Club',
        'technical',
        5500.00,
        4800.00,
        'University Fund',
        '2023-2024',
        'approved'
    ),
    (
        7,
        1,
        'Chess Club',
        'cultural',
        2000.00,
        1500.00,
        'Department Fund',
        '2024-2025',
        'approved'
    ),
    (
        8,
        4,
        'Debate Society',
        'cultural',
        2500.00,
        800.00,
        'Department Fund',
        '2024-2025',
        'approved'
    ),
    (
        9,
        7,
        'Cricket Team',
        'sports',
        5000.00,
        3000.00,
        'University Fund',
        '2024-2025',
        'approved'
    ),
    (
        10,
        1,
        'Photography Club',
        'cultural',
        3000.00,
        1200.00,
        'Department Fund',
        '2024-2025',
        'approved'
    ),
    (
        11,
        4,
        'Finance Club',
        'academic',
        3500.00,
        0.00,
        'Department Fund',
        '2024-2025',
        'pending'
    ),
    (
        12,
        7,
        'Environmental Club',
        'academic',
        4000.00,
        0.00,
        'University Fund',
        '2024-2025',
        'pending'
    ),
    (
        13,
        1,
        'Gaming Club',
        'cultural',
        2500.00,
        0.00,
        'Department Fund',
        '2024-2025',
        'rejected'
    ),
    (
        14,
        4,
        'Dance Team',
        'cultural',
        3000.00,
        2200.00,
        'Department Fund',
        '2024-2025',
        'approved'
    ),
    (
        15,
        7,
        'Rocketry Club',
        'technical',
        7000.00,
        0.00,
        'University Fund',
        '2024-2025',
        'pending'
    );

-- ─── Tax filings  ─────
INSERT INTO
    tax_filing (
        fiscal_year,
        filing_date,
        filing_status,
        total_income,
        total_deductions,
        employee_compensation,
        capital_expenditures,
        research_credits,
        tax_liability
    )
VALUES (
        2021,
        '2022-03-15',
        'filed',
        4200000.00,
        850000.00,
        2800000.00,
        350000.00,
        120000.00,
        285000.00
    ),
    (
        2022,
        '2023-03-20',
        'filed',
        4500000.00,
        920000.00,
        2950000.00,
        380000.00,
        135000.00,
        310000.00
    ),
    (
        2023,
        '2024-03-18',
        'filed',
        4800000.00,
        980000.00,
        3100000.00,
        420000.00,
        150000.00,
        325000.00
    ),
    (
        2024,
        NULL,
        'pending',
        5100000.00,
        1050000.00,
        3250000.00,
        450000.00,
        165000.00,
        340000.00
    ),
    (
        2022,
        '2023-04-10',
        'audited',
        4500000.00,
        920000.00,
        2950000.00,
        380000.00,
        135000.00,
        312000.00
    ),
    (
        2023,
        '2024-04-12',
        'audited',
        4800000.00,
        980000.00,
        3100000.00,
        420000.00,
        150000.00,
        328000.00
    );

-- ─── App users ────────────────────────────────────────────────
-- Role accounts
INSERT INTO
    app_user (
        username,
        password,
        role,
        student_id,
        staff_id
    )
VALUES (
        'finance_user',
        'finance123',
        'finance',
        NULL,
        16
    ),
    (
        'admin_user',
        'admin123',
        'admin',
        NULL,
        17
    ),
    (
        'dean_user',
        'dean123',
        'dean',
        NULL,
        1
    ),
    (
        'registrar_user',
        'registrar123',
        'registrar',
        NULL,
        23
    );

-- Student accounts (first_initial + last_name)
INSERT INTO
    app_user (
        username,
        password,
        role,
        student_id,
        staff_id
    )
VALUES (
        'jsmith',
        'jsmith123',
        'student',
        1,
        NULL
    ),
    (
        'ejohnson',
        'ejohnson123',
        'student',
        2,
        NULL
    ),
    (
        'mwilliams',
        'mwilliams123',
        'student',
        3,
        NULL
    ),
    (
        'sbrown',
        'sbrown123',
        'student',
        4,
        NULL
    ),
    (
        'djones',
        'djones123',
        'student',
        5,
        NULL
    ),
    (
        'jdavis',
        'jdavis123',
        'student',
        6,
        NULL
    ),
    (
        'dmiller',
        'dmiller123',
        'student',
        7,
        NULL
    ),
    (
        'awilson',
        'awilson123',
        'student',
        8,
        NULL
    ),
    (
        'jmoore',
        'jmoore123',
        'student',
        9,
        NULL
    ),
    (
        'ltaylor',
        'ltaylor123',
        'student',
        10,
        NULL
    ),
    (
        'randerson',
        'randerson123',
        'student',
        11,
        NULL
    ),
    (
        'mthomas',
        'mthomas123',
        'student',
        12,
        NULL
    ),
    (
        'wjackson',
        'wjackson123',
        'student',
        13,
        NULL
    ),
    (
        'hwhite',
        'hwhite123',
        'student',
        14,
        NULL
    ),
    (
        'charris',
        'charris123',
        'student',
        15,
        NULL
    ),
    (
        'smartin',
        'smartin123',
        'student',
        16,
        NULL
    ),
    (
        'agarcia',
        'agarcia123',
        'student',
        17,
        NULL
    ),
    (
        'rmartinez',
        'rmartinez123',
        'student',
        18,
        NULL
    ),
    (
        'jrobinson',
        'jrobinson123',
        'student',
        19,
        NULL
    ),
    (
        'nclark',
        'nclark123',
        'student',
        20,
        NULL
    ),
    (
        'rrodriguez',
        'rrodriguez123',
        'student',
        21,
        NULL
    ),
    (
        'slewis',
        'slewis123',
        'student',
        22,
        NULL
    ),
    (
        'blee',
        'blee123',
        'student',
        23,
        NULL
    ),
    (
        'awalker',
        'awalker123',
        'student',
        24,
        NULL
    ),
    (
        'thall',
        'thall123',
        'student',
        25,
        NULL
    ),
    (
        'kallen',
        'kallen123',
        'student',
        26,
        NULL
    ),
    (
        'nyoung',
        'nyoung123',
        'student',
        27,
        NULL
    ),
    (
        'bking',
        'bking123',
        'student',
        28,
        NULL
    ),
    (
        'jwright',
        'jwright123',
        'student',
        29,
        NULL
    ),
    (
        'vscott',
        'vscott123',
        'student',
        30,
        NULL
    );