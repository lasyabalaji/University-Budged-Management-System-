from pydantic import BaseModel
from typing import Optional


class DepartmentCreate(BaseModel):
    abr: str
    dept_name: str
    budget_allocation: float = 0.0


class DepartmentUpdate(BaseModel):
    dept_name: Optional[str] = None
    budget_allocation: Optional[float] = None
