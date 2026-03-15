from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all models to ensure they are registered with SQLAlchemy before table creation
from app.models import User, Product, ExchangeRequest, Favorite  # noqa: F401
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://exchange-app1.vercel.app",
        "https://www.exchange-app1.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
