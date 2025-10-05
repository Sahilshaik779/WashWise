import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError, ProgrammingError

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

DB_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- RE-ADDED: Automatic Database Creation for PostgreSQL ---
try:
    # Connect to the default 'postgres' database to run administrative commands
    server_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/postgres"
    server_engine = create_engine(server_url)

    with server_engine.connect() as connection:
        # Check if the database already exists
        check_db_query = text(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        db_exists = connection.execute(check_db_query).scalar_one_or_none()

        if not db_exists:
            # Set isolation level to AUTOCOMMIT for the CREATE DATABASE command
            connection.execution_options(isolation_level="AUTOCOMMIT").execute(text(f"CREATE DATABASE {DB_NAME}"))
            print(f"Database '{DB_NAME}' created.")
        else:
            print(f"Database '{DB_NAME}' already exists.")
    
    print(f"✅ Database '{DB_NAME}' is ready.")

except OperationalError as e:
    print(f"⚠️  Error during database auto-creation: {e}")
    print("Please ensure the PostgreSQL server is running and the credentials in your .env file are correct.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")


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