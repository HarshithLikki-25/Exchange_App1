from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os

# Import all models to ensure they are registered with SQLAlchemy before table creation
from app.models import User, Product, ExchangeRequest, Favorite, ExchangeSchedule  # noqa: F401
from app.database import engine, Base
# Include routers
from app.routes import auth, products, exchange_requests, exchange_schedules, favorites, notifications, messages, users

app = FastAPI(
    title="Exchange App API",
    description="A product exchange platform for college students — buy, sell, and exchange items with your peers.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware — adjust origins for production
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://exchange-app1.vercel.app",
    "https://www.exchange-app1.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"GLOBAL ERROR: {exc}")
    # Ensure CORS headers are present even on 500 errors
    response = JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )
    origin = request.headers.get("origin")
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
    return response

from sqlalchemy import text

from app.database import engine, Base, DATABASE_URL

@app.on_event("startup")
def startup_event():
    print(f"Backend started. Database: {DATABASE_URL[:20]}...")
    
    # Create all database tables on startup
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables synchronized.")
    except Exception as e:
        print(f"CRITICAL: Table creation failed: {e}")

    # Safety Check: Ensure 'proposed_by_id' column exists in exchange_schedules
    try:
        with engine.begin() as conn:
            # Check if column exists
            if "sqlite" in DATABASE_URL:
                conn.execute(text("ALTER TABLE exchange_schedules ADD COLUMN proposed_by_id INTEGER DEFAULT 1"))
            else:
                conn.execute(text("ALTER TABLE exchange_schedules ADD COLUMN IF NOT EXISTS proposed_by_id INTEGER DEFAULT 1"))
            
            # Reset OTP fields
            if "sqlite" in DATABASE_URL:
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_otp VARCHAR"))
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_otp_expires DATETIME"))
            else:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expires TIMESTAMP"))
                
            print("Safety Migration: Successfully verified schema")
    except Exception as e:
        print(f"Startup check note (likely columns already exist): {e}")

@app.get("/db-check", tags=["Health"])
def db_check():
    is_postgres = "postgresql" in DATABASE_URL or "postgres" in DATABASE_URL
    status = "Active"
    error = None
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        status = "CONNECTION FAILED"
        error = str(e)

    return {
        "database_type": "PostgreSQL" if is_postgres else "SQLite (Ephemeral)",
        "persistence_status": "Persistent" if is_postgres else "TEMPORARY (Data will vanish after deploy)",
        "connection_status": status,
        "database_url_start": DATABASE_URL[:20],
        "error": error
    }

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(exchange_requests.router)
app.include_router(exchange_schedules.router)
app.include_router(favorites.router)
app.include_router(notifications.router)
app.include_router(messages.router)
app.include_router(users.router)


@app.get("/", tags=["Health"])
def root():
    return {"message": "Welcome to Exchange App API", "docs": "/docs"}
