from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional, Literal


class StaffCreate(BaseModel):
    dept_abr: Optional[str]   = None
    first_name: str
    last_name: str
    role: str
    salary: float
    hire_date: date
    email: str
    staff_type: Literal["faculty", "support_staff"]
    reports_to: Optional[int]   = None
    # subtype fields
    academic_rank: Optional[str]   = None   # required when staff_type == 'faculty'
    category: Optional[str]   = None   # required when staff_type == 'support_staff'


class StaffUpdate(BaseModel):
    dept_abr: Optional[str]   = None
    role: Optional[str]   = None
    salary: Optional[float] = None
    email: Optional[str]   = None
    status: Optional[Literal["active", "inactive"]] = None
    reports_to: Optional[int] = None
    academic_rank: Optional[str] = None
    category: Optional[str] = None


class StaffPaymentProcess(BaseModel):
    staff_id: int
    month: int
    year: int
