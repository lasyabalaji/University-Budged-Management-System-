from pydantic import BaseModel
from typing import Optional, Literal


class StudentCreate(BaseModel):
    program_id: int
    first_name: str
    last_name: str
    email: str
    enrollment_year: int
    status: Literal["active", "alumni", "suspended"] = "active"


class StudentUpdate(BaseModel):
    program_id: Optional[int]  = None
    first_name: Optional[str]  = None
    last_name: Optional[str]  = None
    email: Optional[str]  = None
    enrollment_year: Optional[int]  = None
    status: Optional[Literal["active", "alumni", "suspended"]] = None


class EnrollmentRequest(BaseModel):
    student_id: int
    semester_name: Literal["Fall", "Spring", "Summer"]
    year: int


class CourseRegistrationRequest(BaseModel):
    semester_name: Literal["Fall", "Spring", "Summer"]
    year: int
    course_codes: list[str]
