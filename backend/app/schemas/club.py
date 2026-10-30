from pydantic import BaseModel
from typing import Optional, Literal


class ClubCreate(BaseModel):
    staff_id: Optional[int] = None
    club_name: str
    club_category: str
    funding_source: str
    academic_year: str


class ClubFundingDecision(BaseModel):
    action: Literal["approve", "reject"]
    amount: Optional[float] = None   # required when action == 'approve'


class ProgramCostUpdate(BaseModel):
    cost_per_credit: float
