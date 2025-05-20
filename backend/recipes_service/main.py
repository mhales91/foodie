import os
import traceback
from uuid import UUID
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import (
    create_engine,
    MetaData,
    Table,
    Column,
    String,
    Text,
    ARRAY,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from dotenv import load_dotenv

# 1) Load .env
load_dotenv(dotenv_path=".env")
DATABASE_URL = os.getenv("DATABASE_URL")
print("🔗 Using DATABASE_URL =", DATABASE_URL)
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")

# 2) SQLAlchemy setup
engine   = create_engine(DATABASE_URL)
metadata = MetaData()

recipes_table = Table(
    "recipes",
    metadata,
    Column("id",          PGUUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")),
    Column("name",        String,                nullable=False),
    Column("subtitle",    String,                nullable=True),
    Column("ingredients", ARRAY(String),         nullable=False),
    Column("instructions",Text,                  nullable=False),
    Column("image_url",   String,                nullable=True),
    Column("tags",        ARRAY(String),         nullable=True),
    Column("source_url",  String,                nullable=True),
)

# Auto-create if missing
metadata.create_all(engine)

# 3) Pydantic models
class RecipeBase(BaseModel):
    name: str
    subtitle: Optional[str] = None
    ingredients: List[str]
    instructions: str
    image_url: Optional[str] = None
    tags: Optional[List[str]] = []
    source_url: Optional[str] = None

class RecipeIn(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: UUID

# 4) FastAPI app
app = FastAPI(title="Recipes Service")

@app.get("/recipes", response_model=List[Recipe])
def read_recipes(skip: int = 0, limit: int = 100):
    try:
        with engine.connect() as conn:
            stmt   = recipes_table.select().offset(skip).limit(limit)
            result = conn.execute(stmt)
            rows   = result.mappings().all()      # <-- returns list[dict]
            return [Recipe(**row) for row in rows]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recipes/{recipe_id}", response_model=Recipe)
def read_recipe(recipe_id: UUID):
    with engine.connect() as conn:
        stmt   = recipes_table.select().where(recipes_table.c.id == recipe_id)
        result = conn.execute(stmt)
        row    = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Recipe not found")
        return Recipe(**row)

@app.post("/recipes", response_model=Recipe, status_code=201)
def create_recipe(recipe_in: RecipeIn):
    values = recipe_in.dict()
    with engine.begin() as conn:
        stmt   = recipes_table.insert().values(**values).returning(*recipes_table.c)
        result = conn.execute(stmt)
        row    = result.mappings().first()
        return Recipe(**row)