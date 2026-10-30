from fastapi import APIRouter, HTTPException
import mysql.connector

from app.db import get_connection
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT user_id, username, role, student_id, staff_id
            FROM app_user
            WHERE username = %s AND password = %s
            """,
            (body.username, body.password),
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        return user
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
