from pydantic import BaseModel
from typing import Literal, Optional


class ScholarshipCreate(BaseModel):
    scholarship_name: str
    scholarship_type: Literal["percent", "fixed"] = "percent"
    percent_coverage: float = 0.0
    fixed_amount: float = 0.0
    total_amount: float
    eligibility_criteria: str
    created_by: Optional[int] = None


class ScholarshipApply(BaseModel):
    student_id: int
    scholarship_id: int


class ScholarshipDecision(BaseModel):
    action: Literal["approve", "reject", "hold"]
    staff_id: Optional[int] = None
