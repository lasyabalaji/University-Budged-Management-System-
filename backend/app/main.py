from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import mysql.connector

from app.routers import auth, finance, admin, dean, registrar, student

app = FastAPI(title="UBMS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global handler so DB errors always return JSON
@app.exception_handler(mysql.connector.Error)
async def mysql_exception_handler(request: Request, exc: mysql.connector.Error):
    return JSONResponse(status_code=500, content={"detail": str(exc)})

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(finance.router, prefix="/api/v1/finance", tags=["finance"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(dean.router, prefix="/api/v1/dean", tags=["dean"])
app.include_router(registrar.router, prefix="/api/v1/registrar", tags=["registrar"])
app.include_router(student.router, prefix="/api/v1/student", tags=["student"])


@app.get("/")
def root():
    return {"message": "UBMS API is running"}
