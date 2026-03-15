# 🎓 Exchange App — College Student Product Exchange Platform

A RESTful backend API built with **FastAPI**, **SQLite**, and **SQLAlchemy** for a peer-to-peer product exchange platform for college students.

---

## 🚀 Quick Start

### 1. Clone / navigate to project directory
```bash
cd Exchange_App1
```

### 2. Create and activate a virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
The `.env` file is already provided with defaults for local development:
```env
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./exchange.db
```

### 5. Run the server
```bash
uvicorn app.main:app --reload
```

> The server starts at **http://127.0.0.1:8000**
> SQLite database (`exchange.db`) is **auto-created** on first run.

### 6. Explore the API
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📁 Project Structure

```
Exchange_App1/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # SQLite engine + session
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── product.py           # Product model
│   │   └── exchange_request.py  # ExchangeRequest model
│   ├── schemas/
│   │   ├── user.py              # User Pydantic schemas
│   │   ├── product.py           # Product Pydantic schemas
│   │   └── exchange_request.py  # ExchangeRequest Pydantic schemas
│   ├── routes/
│   │   ├── auth.py              # /auth routes
│   │   ├── products.py          # /products routes
│   │   └── exchange_requests.py # /exchange-requests routes
│   ├── services/
│   │   ├── user_service.py      # Auth business logic
│   │   ├── product_service.py   # Product business logic
│   │   └── exchange_service.py  # Exchange request business logic
│   └── utils/
│       └── auth.py              # JWT + bcrypt helpers
├── .env
├── requirements.txt
└── README.md
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register a new user |
| `POST` | `/auth/login` | ❌ | Login and get JWT token |
| `GET` | `/auth/me` | ✅ | Get current user profile |

#### Register
```json
POST /auth/register
{
  "name": "Alice",
  "email": "alice@college.edu",
  "password": "strongpassword",
  "college": "MIT",
  "location": "Cambridge, MA"
}
```

#### Login
```json
POST /auth/login
{
  "email": "alice@college.edu",
  "password": "strongpassword"
}
// Response: { "access_token": "...", "token_type": "bearer" }
```

---

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/products` | ✅ | Create a new listing |
| `GET` | `/products` | ❌ | Browse all listings |
| `GET` | `/products/{id}` | ❌ | Get product details |
| `DELETE` | `/products/{id}` | ✅ | Delete your own listing |

#### Create Product
```json
POST /products
Authorization: Bearer <token>
{
  "title": "Calculus Textbook",
  "description": "Used, good condition",
  "category": "Books",
  "condition": "Good",
  "image_url": "https://example.com/image.jpg"
}
```

---

### Exchange Requests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/exchange-requests` | ✅ | Request an exchange |
| `GET` | `/exchange-requests` | ✅ | View your exchange requests |

> ⚠️ Users **cannot** request exchanges on their own products.
> ⚠️ Duplicate requests for the same product are **prevented**.

#### Send Exchange Request
```json
POST /exchange-requests
Authorization: Bearer <token>
{
  "product_id": 1,
  "message": "Hi! I'd love to exchange this for my Python book."
}
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** via `passlib`
- Authentication via **JWT tokens** (`python-jose`)
- Protected routes require `Authorization: Bearer <token>` header
- **CORS** enabled for all origins (restrict in production)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI |
| ORM | SQLAlchemy 2.x |
| Database | SQLite (local) |
| Authentication | JWT (`python-jose`) |
| Password Hashing | bcrypt (`passlib`) |
| Validation | Pydantic v2 |
| Server | Uvicorn |