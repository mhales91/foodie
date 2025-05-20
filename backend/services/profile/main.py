import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import engine

app = FastAPI(title="Profile Service")

# allow React on localhost:3000
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_methods=["*"],
  allow_headers=["*"],
)

class ProfileIn(BaseModel):
    user_id: uuid.UUID
    household_size: int
    dietary_preferences: list[str]

class ProfileOut(ProfileIn):
    id: uuid.UUID

@app.post("/profiles", response_model=ProfileOut)
async def create_profile(p: ProfileIn):
    profile_id = uuid.uuid4()
    try:
        with engine.connect() as conn:
            conn.execute(
                """
                INSERT INTO profiles (id, user_id, household_size, dietary_preferences)
                VALUES (%s, %s, %s, %s)
                """,
                (profile_id, p.user_id, p.household_size, p.dietary_preferences),
            )
    except Exception:
        raise HTTPException(status_code=500, detail="Could not create profile")
    return {**p.dict(), "id": profile_id}

@app.get("/profiles/{user_id}", response_model=ProfileOut)
async def get_profile(user_id: uuid.UUID):
    with engine.connect() as conn:
        row = conn.execute(
            "SELECT id, user_id, household_size, dietary_preferences FROM profiles WHERE user_id = %s",
            (user_id,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    id, uid, size, prefs = row
    return {"id": id, "user_id": uid, "household_size": size, "dietary_preferences": prefs}