export interface Staff {
  staff_id: number; dept_abr: string | null; dept_name: string | null
  first_name: string; last_name: string; role: string
  salary: number; hire_date: string; email: string
  status: string; staff_type: string; reports_to: number | null
  academic_rank?: string; category?: string
}

export interface Student {
  student_id: number; program_id: number; program_name: string
  degree_level: string; dept_name: string
  first_name: string; last_name: string
  email: string; enrollment_year: number; status: string
}

export interface Course {
  course_code: string; abr: string; course_id: number; dept_name: string
  course_name: string; credit_hours: number
}

export interface Program {
  program_id: number; dept_abr: string; dept_name: string
  program_name: string; degree_level: string
  duration_years: number; cost_per_credit: number
  enrolled_students: number
}

export interface Scholarship {
  scholarship_id: number; scholarship_name: string
  scholarship_type: 'percent' | 'fixed'
  percent_coverage: number; fixed_amount: number
  original_amount: number; total_amount: number
  eligibility_criteria: string; remaining_balance: number
  total_applications: number; approved_count: number
}

export interface StudentScholarship {
  student_id: number; scholarship_id: number
  scholarship_name: string; scholarship_type: 'percent' | 'fixed'
  percent_coverage: number; fixed_amount: number
  status: string; award_date: string | null
  percent_discount: number | null; fixed_award: number | null
  first_name: string; last_name: string; email: string
  remaining_balance: number
}

export interface Club {
  club_id: number; staff_id: number | null; staff_name: string | null
  dept_abr: string | null; dept_name: string | null
  club_name: string; club_category: string
  allocated_amount: number; spent_amount: number
  funding_source: string; academic_year: string; approval_status: string
}

export interface Job {
  job_id: number; title: string; positions_available: number
  description: string | null; hourly_rate: number; availability_status: string
}

export interface Payroll {
  payroll_id: number; student_id: number; job_id: number
  first_name: string; last_name: string; job_title: string
  period_start: string; period_end: string
  hours_worked: number; hourly_rate: number; gross_pay: number
  payment_status: string; payment_date: string | null
}

export interface TuitionFee {
  fee_id: number; student_id: number; semester_name: string; year: number
  first_name: string; last_name: string
  total_credit_hours: number; total_amount: number
  due_date: string; payment_date: string | null
  payment_method: string | null; payment_status: string
}

export interface TaxFiling {
  filing_id: number; fiscal_year: number; filing_date: string | null
  filing_status: string; total_income: number; total_deductions: number
  employee_compensation: number; capital_expenditures: number
  research_credits: number; tax_liability: number
}

export interface UtilityBill {
  bill_id: number; building_name: string; building_type: string
  utility_type: string; amount: number
  billing_month: number; billing_year: number; payment_status: string
}

export interface MiscPayment {
  payment_id: number; description: string; category: string
  item_name: string; amount: number
  payment_date: string; payment_status: string
}

export interface BudgetDashboard {
  abr: string; dept_name: string; budget_allocation: number
  total_spent: number; surplus_deficit: number
  staff_count: number; student_count: number
  course_count: number; club_count: number
}

export interface SpendingCategory {
  category: string; total: number
}

export interface TuitionComparison {
  semester_name: string; year: number; student_count: number
  gross_tuition: number; percent_discount: number
  expected_revenue: number; actual_revenue: number; outstanding: number
}

export interface StaffPayment {
  payment_id: number; staff_id: number
  first_name: string; last_name: string; email: string
  month: number; year: number
  gross_pay: number; deductions: number; net_pay: number
  payment_date: string | null; payment_status: string
}
