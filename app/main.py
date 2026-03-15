from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os

# Import all models to ensure they are registered with SQLAlchemy before table creation
from app.models import User, Product, ExchangeRequest, Favorite, ExchangeSchedule  # noqa: F401
from app.database import engine, Base
from app.routes import auth, products, exchange_requests, exchange_schedules, favorites, notifications, messages, users

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

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

@app.on_event("startup")
def startup_event():
    db_url = str(os.getenv("DATABASE_URL", "sqlite"))
    print(f"Backend started. Database: {db_url[:15]}...")
    
    # Safety Check: Ensure 'proposed_by_id' column exists in exchange_schedules
    # This prevents 500 errors if the table was created before the column was added
    try:
        with engine.begin() as conn:
            # Check if column exists
            if "sqlite" in db_url:
                conn.execute(text("ALTER TABLE exchange_schedules ADD COLUMN proposed_by_id INTEGER DEFAULT 1"))
            else:
                # Postgres usually needs a more specific check or just try-catch
                conn.execute(text("ALTER TABLE exchange_schedules ADD COLUMN IF NOT EXISTS proposed_by_id INTEGER DEFAULT 1"))
            
            # Reset OTP fields
            if "sqlite" in db_url:
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_otp VARCHAR"))
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_otp_expires DATETIME"))
            else:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expires TIMESTAMP"))
                
            print("Safety Migration: Checked/Applied reset fields to users")
    except Exception as e:
        # If it fails, the column likely already exists, so we just log and continue
        print(f"Startup check note: {e}")

@app.get("/db-check", tags=["Health"])
def db_check():
    db_url = str(os.getenv("DATABASE_URL", "sqlite"))
    is_postgres = "postgresql" in db_url or "postgres" in db_url
    return {
        "database_type": "PostgreSQL" if is_postgres else "SQLite (Ephemeral)",
        "persistence_status": "Persistent" if is_postgres else "TEMPORARY (Data will vanish after deploy)",
        "connection_start": db_url[:10] + "..."
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
