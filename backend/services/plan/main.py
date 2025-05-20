# backend/services/plan/main.py

import uuid
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text

from db import engine


app = FastAPI(title="Plan Service")

# CORS – allow your React app at localhost:3000 to talk here
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 0️⃣ Root health check
@app.get("/")
async def read_root():
    return {"status": "Plan Service is up and running!"}


# 1️⃣ Pydantic models
class PlanIn(BaseModel):
    user_id: uuid.UUID
    week_start: str            # "YYYY-MM-DD"
    recipes: List[uuid.UUID]


class PlanOut(PlanIn):
    id: uuid.UUID


# 2️⃣ Create a new plan
@app.post("/plans", response_model=PlanOut)
async def create_plan(p: PlanIn):
    plan_id = uuid.uuid4()
    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    INSERT INTO plans (id, user_id, week_start, recipes)
                    VALUES (:id, :user_id, :week_start, :recipes)
                    """
                ),
                {
                    "id": str(plan_id),
                    "user_id": str(p.user_id),
                    "week_start": p.week_start,
                    "recipes": [str(r) for r in p.recipes],
                },
            )
    except Exception as e:
        print("Error inserting plan:", repr(e))
        raise HTTPException(status_code=500, detail="Could not create plan")

    return {**p.dict(), "id": plan_id}


# 3️⃣ List all plans for a given user
@app.get("/plans/{user_id}", response_model=List[PlanOut])
async def list_plans(user_id: uuid.UUID):
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT id, user_id, week_start, recipes
                  FROM plans
                 WHERE user_id = :uid
                """
            ),
            {"uid": str(user_id)},
        ).all()

    return [
        {
            "id": row.id,
            "user_id": row.user_id,
            "week_start": row.week_start.isoformat(),
            "recipes": row.recipes,
        }
        for row in rows
    ]