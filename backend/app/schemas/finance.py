from pydantic import BaseModel
from datetime import date
from typing import Optional, Literal


class TaxFilingCreate(BaseModel):
    fiscal_year: int
    filing_date: Optional[date]  = None
    filing_status: Literal["pending", "filed", "audited"] = "pending"
    total_income: float = 0.0
    total_deductions: float = 0.0
    employee_compensation: float = 0.0
    capital_expenditures: float = 0.0
    research_credits: float = 0.0
    tax_liability: float = 0.0


class TaxFilingUpdate(BaseModel):
    filing_date: Optional[date]  = None
    filing_status: Optional[Literal["pending", "filed", "audited"]] = None
    total_income: Optional[float] = None
    total_deductions: Optional[float] = None
    employee_compensation: Optional[float] = None
    capital_expenditures: Optional[float] = None
    research_credits: Optional[float] = None
    tax_liability: Optional[float] = None


class UtilityBillCreate(BaseModel):
    building_name: str
    building_type: str
    utility_type: Literal["electricity", "water", "gas", "internet", "heating", "other"]
    amount: float
    billing_month: int
    billing_year: int
    payment_status: Literal["unpaid", "paid", "overdue"] = "unpaid"


class UtilityBillUpdate(BaseModel):
    payment_status: Literal["unpaid", "paid", "overdue"]


class MiscPaymentCreate(BaseModel):
    description: str
    category: str
    item_name: str
    amount: float
    payment_date:   date
    payment_status: Literal["paid", "pending"] = "pending"
