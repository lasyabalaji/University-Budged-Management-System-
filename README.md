# University Budget Management System (UBMS)

**CS5200 — Database Management Systems | Northeastern University**
**Group: BalajiSMandalaS** (Sree Lasya Balaji & Shriya Mandala)

A full-stack university budget management system built with **MySQL 8**, **FastAPI**, and **Next.js 14**.

---

## Project Structure

```
ubms/
├── backend/
│   ├── sql/
│   │   ├── schema.sql       # DDL — all tables
│   │   ├── functions.sql    # UDFs
│   │   ├── procedures.sql   # Stored procedures
│   │   ├── triggers.sql     # Triggers
│   │   ├── events.sql       # Scheduled events
│   │   └── seed_data.sql    # Sample data (from universitybudget_data.xlsx)
│   ├── app/
│   │   ├── main.py
│   │   ├── db.py
│   │   ├── config.py
│   │   └── routers/         # auth, finance, admin, dean, registrar, student
│   ├── requirements.txt
│   └── .env                 # DB credentials (create this — see below)
└── frontend/
    ├── app/                 # Next.js App Router pages
    ├── components/
    ├── lib/
    ├── types/
    └── .env.local           # API URL (create this — see below)
```

---

## Prerequisites

| Tool    | Version |
| ------- | ------- |
| MySQL   | 8.0+    |
| Python  | 3.10+   |
| Node.js | 18+     |
| npm     | 9+      |

---

## Step 1 — Database Setup

### 1.1 Open MySQL Workbench (or MySQL CLI)

Run the SQL files **in this exact order**:

```sql
source /path/to/ubms/backend/sql/schema.sql
source /path/to/ubms/backend/sql/functions.sql
source /path/to/ubms/backend/sql/procedures.sql
source /path/to/ubms/backend/sql/triggers.sql
source /path/to/ubms/backend/sql/events.sql
source /path/to/ubms/backend/sql/seed_data.sql
```

> **Windows paths** — use forward slashes in MySQL CLI:
> `source F:/Lasya NEU/CS5200_DBMS/Project/ubms/backend/sql/schema.sql`

### 1.2 What each file does

| File             | Purpose                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema.sql`     | Drops & recreates the `ubms` database; creates all 23 tables                                                                                                  |
| `functions.sql`  | Creates 4 UDFs: `fn_calculate_tuition`, `fn_total_budget_spent`, `fn_scholarship_balance`, `fn_student_net_earnings`                                          |
| `procedures.sql` | Creates stored procedures: `sp_enroll_student`, `sp_process_staff_payment`, `sp_approve_scholarship`, `sp_approve_club_funding`, `sp_process_student_payroll` |
| `triggers.sql`   | Creates triggers: auto-create tuition fee on enrollment, 2-job limit, club overspend check, salary audit                                                      |
| `events.sql`     | Scheduled events: daily overdue tuition flag, monthly overdue utility bill flag                                                                               |
| `seed_data.sql`  | Inserts all sample data — 30 staff, 30 students, 30 courses, 10 programs, payroll, clubs, etc.                                                                |

> `schema.sql` **drops the entire `ubms` database** before recreating it. Always run it first on a clean slate.

---

## Step 2 — Backend Setup (FastAPI)

### 2.1 Create the `.env` file

Inside `ubms/backend/`, create a file named `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ubms
```

### 2.2 Install dependencies

```bash
cd ubms/backend
pip install -r requirements.txt
```

`requirements.txt` includes:

```
fastapi==0.115.5
uvicorn==0.32.1
mysql-connector-python==9.1.0
pydantic==2.10.3
python-dotenv==1.0.1
```

### 2.3 Run the backend

```bash
cd ubms/backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**

Interactive docs: **http://localhost:8000/docs**

---

## Step 3 — Frontend Setup (Next.js)

### 3.1 Create the `.env.local` file

Inside `ubms/frontend/`, create a file named `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3.2 Install dependencies

```bash
cd ubms/frontend
npm install
```

### 3.3 Run the frontend (development)

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 3.4 Build for production

```bash
npm run build
npm start
```

---

## Step 4 — Login & Demo Accounts

Open **http://localhost:3000** and log in with any of the following accounts:

### Staff / Admin Roles

| Username         | Password       | Role      | Access                                                               |
| ---------------- | -------------- | --------- | -------------------------------------------------------------------- |
| `finance_user`   | `finance123`   | Finance   | Budget dashboard, tuition, tax filings, utility bills, misc payments |
| `admin_user`     | `admin123`     | Admin     | Staff management, job postings, payroll processing                   |
| `dean_user`      | `dean123`      | Dean      | Programs, scholarships, clubs                                        |
| `registrar_user` | `registrar123` | Registrar | Student records, course management, enrollment                       |

### Student Accounts

| Username   | Password      | Student                                   |
| ---------- | ------------- | ----------------------------------------- |
| `jsmith`   | `jsmith123`   | John Smith (BS Computer Science)          |
| `ejohnson` | `ejohnson123` | Emily Johnson (BS Computer Science)       |
| `dmiller`  | `dmiller123`  | Daniel Miller (BS Mechanical Engineering) |
| `ltaylor`  | `ltaylor123`  | Lauren Taylor (BS Mathematics)            |
| `wjackson` | `wjackson123` | William Jackson (BS Physics)              |

All 30 student accounts follow the pattern `first_initial + last_name` / `username + 123`.

---

## Database Objects Summary

### Tables (23)

`department`, `staff`, `faculty`, `support_staff`, `staff_salary_audit`, `staff_payment`, `program`, `course`, `program_course`, `student`, `semester`, `course_registration`, `tuition_fee`, `scholarship`, `student_scholarship`, `on_campus_job`, `student_job`, `payroll`, `utility_bill`, `misc_payment`, `club`, `tax_filing`, `app_user`

### Stored Procedures (5)

| Procedure                    | Description                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `sp_enroll_student`          | Enrolls a student in multiple courses (comma-separated IDs); trigger auto-creates tuition fee |
| `sp_process_staff_payment`   | Processes monthly salary payment for a staff member                                           |
| `sp_approve_scholarship`     | Awards a scholarship to a student and deducts from the pool                                   |
| `sp_approve_club_funding`    | Approves a club's funding request                                                             |
| `sp_process_student_payroll` | Processes a student's campus job payroll record                                               |

### UDFs (4)

| Function                                           | Returns                                                  |
| -------------------------------------------------- | -------------------------------------------------------- |
| `fn_calculate_tuition(student_id, semester, year)` | Total tuition owed for a student in a semester           |
| `fn_total_budget_spent(dept_id)`                   | Total spending (staff pay + club spend) for a department |
| `fn_scholarship_balance(scholarship_id)`           | Remaining scholarship pool balance                       |
| `fn_student_net_earnings(student_id)`              | Total gross pay earned by a student                      |

### Triggers (5)

| Trigger                           | When                               | What it does                                        |
| --------------------------------- | ---------------------------------- | --------------------------------------------------- |
| `trg_after_registration_insert`   | After `course_registration` INSERT | Auto-creates / updates aggregated `tuition_fee`     |
| `trg_check_job_limit`             | Before `student_job` INSERT        | Blocks if student already holds 2 jobs              |
| `trg_check_club_overspend`        | Before `club` UPDATE               | Blocks if `spent_amount` exceeds `allocated_amount` |
| `trg_staff_salary_audit`          | After `staff` UPDATE               | Logs salary changes to `staff_salary_audit`         |
| `trg_scholarship_original_amount` | Before `scholarship` INSERT        | Auto-sets `original_amount = total_amount`          |

### Scheduled Events (2)

| Event                      | Schedule | What it does                                              |
| -------------------------- | -------- | --------------------------------------------------------- |
| `evt_flag_overdue_tuition` | Daily    | Marks unpaid tuition fees as `overdue` when past due date |
| `evt_flag_overdue_utility` | Monthly  | Marks unpaid utility bills as `overdue`                   |

---

## API Endpoints Summary

All endpoints are prefixed with `/api/v1`.

| Prefix          | Router    | Key Endpoints                                                                  |
| --------------- | --------- | ------------------------------------------------------------------------------ |
| `/auth`         | Auth      | `POST /login`                                                                  |
| `/finance`      | Finance   | Budget dashboard, tuition, tax filings, utility bills, misc payments, spending |
| `/admin`        | Admin     | Staff CRUD, job postings, payroll processing, staff payments                   |
| `/dean`         | Dean      | Programs, scholarships, club funding                                           |
| `/registrar`    | Registrar | Students, courses, enrollment, tuition comparison                              |
| `/student/{id}` | Student   | Profile, tuition, scholarships, payroll                                        |

---

## Troubleshooting

**`only_full_group_by` error during seed** — Re-run `functions.sql` first, then `seed_data.sql`.

**Backend can't connect to MySQL** — Check `.env` credentials; ensure MySQL service is running.

**Frontend shows "Request failed"** — Confirm backend is running on port 8000 and `.env.local` has the correct `NEXT_PUBLIC_API_URL`.

**CORS error in browser** — Backend is configured for `http://localhost:3000` only. Do not change the frontend port.

**Scheduled events not firing** — Ensure MySQL event scheduler is enabled:

```sql
SET GLOBAL event_scheduler = ON;
```
