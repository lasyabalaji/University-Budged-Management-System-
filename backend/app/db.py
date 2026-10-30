import mysql.connector
from mysql.connector import Error
from app.config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME


def get_connection() -> mysql.connector.MySQLConnection:
    """Return a new MySQL connection. Caller is responsible for closing it."""
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        autocommit=False,
    )
