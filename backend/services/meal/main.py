# backend/services/meal/main.py

import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text

from db import engine

app = FastAPI(title="Meal Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecipeIn(BaseModel):
    name: str
    ingredients: list[str]
    instructions: str
    image_url: str

class RecipeOut(RecipeIn):
    id: uuid.UUID

@app.post("/recipes", response_model=RecipeOut)
async def create_recipe(r: RecipeIn):
    rid = uuid.uuid4()
    try:
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO recipes
                      (id, name, ingredients, instructions, image_url)
                    VALUES
                      (:id, :name, :ingredients, :instructions, :image_url)
                """),
                {
                  "id": str(rid),
                  "name": r.name,
                  "ingredients": r.ingredients,
                  "instructions": r.instructions,
                  "image_url": r.image_url
                },
            )
    except Exception as e:
        print("Error inserting recipe:", repr(e))
        raise HTTPException(500, "Could not create recipe")
    return {**r.dict(), "id": rid}

@app.get("/recipes", response_model=list[RecipeOut])
async def list_recipes():
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
              SELECT id, name, ingredients, instructions, image_url
                FROM recipes
            """)
        ).all()
    return [
      {
        "id": row.id,
        "name": row.name,
        "ingredients": row.ingredients,
        "instructions": row.instructions,
        "image_url": row.image_url
      }
      for row in rows
    ]

@app.get("/recipes/{recipe_id}", response_model=RecipeOut)
async def get_recipe(recipe_id: uuid.UUID):
    with engine.connect() as conn:
        row = conn.execute(
            text("""
              SELECT id, name, ingredients, instructions, image_url
                FROM recipes
               WHERE id = :id
            """),
            {"id": str(recipe_id)},
        ).first()
    if not row:
        raise HTTPException(404, "Recipe not found")
    return {
      "id": row.id,
      "name": row.name,
      "ingredients": row.ingredients,
      "instructions": row.instructions,
      "image_url": row.image_url
    }