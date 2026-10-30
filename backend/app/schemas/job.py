from pydantic import BaseModel
from datetime import date
from typing import Optional, Literal


class JobCreate(BaseModel):
    title: str
    positions_available: int = 1
    description: Optional[str] = None
    hourly_rate: float
    availability_status: Literal["open", "closed", "filled"] = "open"


class JobUpdate(BaseModel):
    title: Optional[str] = None
    positions_available: Optional[int] = None
    description: Optional[str] = None
    hourly_rate: Optional[float] = None
    availability_status: Optional[Literal["open", "closed", "filled"]] = None


class PayrollCreate(BaseModel):
    student_id: int
    job_id: int
    hours_worked: float
    period_start: date
    period_end: date


class TuitionPayRequest(BaseModel):
    payment_method: str
