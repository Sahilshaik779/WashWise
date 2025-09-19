# database.py
import pymysql
pymysql.install_as_MySQLdb()

# database.py
# database.py
import pymysql
pymysql.install_as_MySQLdb()

# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:Sahil%402127@127.0.0.1:3306/laundry_db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,       # logs SQL statements for debugging
    future=True
)

# ----------------------
# Create session class
# ----------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ----------------------
# Base class for models
# ----------------------
Base = declarative_base()

# ----------------------
# Dependency for FastAPI routes
# ----------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------
# Optional: auto-create tables on import
# ----------------------
# Import your models here to ensure tables are created
from database import Base, engine
from models import User, Customer
Base.metadata.create_all(bind=engine)
