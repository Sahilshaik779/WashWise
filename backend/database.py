import pymysql
pymysql.install_as_MySQLdb()

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import re

# --- Database Configuration ---
DB_URL = "mysql+pymysql://root:Sahil%402127@127.0.0.1:3306/laundry_db_v2"

# --- Automatic Database Creation ---
try:
    # Extract DB name from the URL to create it if it doesn't exist
    db_name_match = re.search(r"/(\w+)$", DB_URL)
    if not db_name_match:
        raise ValueError("Could not determine database name from DB_URL")
    
    DB_NAME = db_name_match.group(1)
    # Connect to the server without specifying a database
    server_url = DB_URL.rsplit('/', 1)[0]
    
    server_engine = create_engine(server_url)
    with server_engine.connect() as connection:
        connection.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}"))
    print(f"✅ Database '{DB_NAME}' is ready.")
    
except (OperationalError, ValueError) as e:
    print(f"⚠️  Error during database auto-creation: {e}")
    print("Please ensure the MySQL server is running and the credentials in 'database.py' are correct.")
    # as it will provide a clear error to the user if the DB still can't be accessed.

# --- Main Engine and Session Setup ---
# Create the engine that connects to the specific database
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

