# backend/services/shopping/main.py

import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from db import engine

app = FastAPI(title="Shopping List Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/shopping-lists/{plan_id}")
async def get_shopping_list(plan_id: uuid.UUID):
    # 1. Fetch recipes[] from plans
    with engine.connect() as conn:
        plan = conn.execute(
            text("SELECT recipes FROM plans WHERE id = :pid"),
            {"pid": str(plan_id)},
        ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    recipe_ids = plan.recipes  # a list of UUID strings

    # 2. For each recipe, fetch ingredients[]
    all_items = []
    with engine.connect() as conn:
        for rid in recipe_ids:
            rows = conn.execute(
                text("SELECT ingredients FROM recipes WHERE id = :rid"),
                {"rid": str(rid)},
            ).all()
            for row in rows:
                # row.ingredients is a list of strings
                all_items.extend(row.ingredients)

    # 3. Deduplicate & sort
    unique_items = sorted(set(all_items))

    return {"plan_id": plan_id, "items": unique_items}