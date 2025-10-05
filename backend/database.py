import pymysql
pymysql.install_as_MySQLdb()

import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import re

# --- Load Environment Variables ---
load_dotenv()

# --- Database Configuration ---
DB_USER = os.getenv("DB_USER")
DB_PASSWORD_RAW = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

if not all([DB_USER, DB_PASSWORD_RAW, DB_HOST, DB_PORT, DB_NAME]):
    raise ValueError("One or more database environment variables (DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME) are missing. Please check your .env file.")

DB_PASSWORD = quote_plus(DB_PASSWORD_RAW)

DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- Automatic Database Creation ---
try:
    # Connect to the server without specifying a database
    server_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}"
    
    server_engine = create_engine(server_url)
    with server_engine.connect() as connection:
        connection.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}"))
    print(f"✅ Database '{DB_NAME}' is ready.")
    
except (OperationalError, ValueError) as e:
    print(f"⚠️  Error during database auto-creation: {e}")
    print("Please ensure the MySQL server is running and the credentials in your .env file are correct.")

# --- Main Engine and Session Setup ---
engine = create_engine(
    DB_URL,
    echo=True,      
    future=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()