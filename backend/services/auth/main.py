# backend/services/auth/main.py

import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from db import engine

app = FastAPI(title="Auth Service")

# CORS: allow your React app to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup check: verify DB connection
@app.on_event("startup")
def on_startup():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
    except Exception as e:
        print("❌ Database connection failed:", e)

# Root endpoint
@app.get("/")
async def read_root():
    return {"message": "Auth service running!"}

# Pydantic model for user creation
class UserCreate(BaseModel):
    email: str
    display_name: str = None

# POST /users: create a new user
@app.post("/users")
async def create_user(user: UserCreate):
    user_id = str(uuid.uuid4())
    try:
        # engine.begin() starts a transaction and commits on exit
        with engine.begin() as conn:
            conn.execute(
                text(
                    "INSERT INTO users (id, email, display_name) "
                    "VALUES (:id, :email, :display_name)"
                ),
                {"id": user_id, "email": user.email, "display_name": user.display_name},
            )
    except Exception as e:
        # Print full exception to console for debugging
        print("Error inserting user:", repr(e))
        raise HTTPException(status_code=500, detail="Unable to create user")
    return {"id": user_id, "email": user.email, "display_name": user.display_name}