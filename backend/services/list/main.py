from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
from db import engine

app = FastAPI()

class UserCreate(BaseModel):
    email: str
    display_name: str = None

@app.post("/users")
def create_user(user: UserCreate):
    user_id = str(uuid.uuid4())
    with engine.connect() as conn:
        result = conn.execute(
            "INSERT INTO users (id, email, display_name) VALUES (%s, %s, %s) RETURNING id",
            (user_id, user.email, user.display_name)
        )
    return {"id": user_id, "email": user.email, "display_name": user.display_name}