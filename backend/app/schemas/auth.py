from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    user_id: int
    username: str
    role: str
    student_id: int | None = None
    staff_id: int | None = None
