# app/main.py
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.api import auth, orders, users
from app.db.session import engine
from app.db.models import Base
from app.schemas import SERVICE_PRICES, SERVICE_WORKFLOWS # Moved import to top for cleanliness

# Create Tables (Consider using Alembic for production instead)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# --- Middleware ---
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    https_only=settings.ENVIRONMENT == "production",
    max_age=1800
)

# ✅ FIX: Create the origins list first, including the Production URL
origins = [
    "http://localhost:3000",      # Local React
    "http://127.0.0.1:3000",      # Local React IP
    "http://localhost:5173",      # Local Vite (Default)
    settings.FRONTEND_URL,        # <--- Vercel URL (This links your .env variable!)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # ✅ FIX: Pass the complete list here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static Files (QR Codes) ---
# Ensure the folder exists
os.makedirs("qr_codes", exist_ok=True)
app.mount("/qr_codes", StaticFiles(directory="qr_codes"), name="qrcodes")

# --- Routes ---
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])

# --- Config Endpoint (The "Truth" for Frontend) ---
@app.get("/system/config")
def get_system_config():
    return {
        "prices": SERVICE_PRICES,
        "workflows": SERVICE_WORKFLOWS
    }