import json
import os
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, Table, Column, String, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID as PGUUID

# 1) Load .env
load_dotenv(dotenv_path=Path(__file__).parent / ".env")
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")

# 2) Re-define the same table
engine = create_engine(DATABASE_URL)
metadata = MetaData()

recipes_table = Table(
    "recipes",
    metadata,
    Column("id", PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    Column("name", String, nullable=False),
    Column("subtitle", String, nullable=True),
    Column("ingredients", ARRAY(String), nullable=False),
    Column("instructions", Text, nullable=False),
    Column("image_url", String, nullable=True),
    Column("tags", ARRAY(String), nullable=True),
    Column("source_url", String, nullable=True),
)

# 3) Ensure it exists
metadata.create_all(engine)

# 4) Load JSON
data_path = Path(__file__).parent / "data" / "recipes.json"
print(f"Loading JSON from {data_path}")
with open(data_path, encoding="utf-8") as f:
    payload = json.load(f)

recipes = payload if isinstance(payload, list) else payload.get("recipes", [])
if not isinstance(recipes, list):
    raise RuntimeError("recipes.json format not understood")

# 5) Insert each
with engine.begin() as conn:
    for r in recipes:
        name       = r.get("title") or r.get("name") or "Untitled"
        subtitle   = r.get("subtitle")
        image_url  = r.get("image_url")
        source_url = r.get("source_url")
        raw_ings   = r.get("ingredients", [])
        ings       = []
        for ing in raw_ings:
            if isinstance(ing, dict):
                parts = [ ing.get(k, "") for k in ("quantity","unit","name") ]
                txt   = " ".join(p for p in parts if p).strip()
                ings.append(txt or str(ing))
            else:
                ings.append(str(ing))
        inst = r.get("instructions", "")
        if isinstance(inst, list):
            inst = "\n".join(inst)
        tags = r.get("tags") or []

        stmt = recipes_table.insert().values(
            id           = uuid4(),
            name         = name,
            subtitle     = subtitle,
            ingredients  = ings,
            instructions = inst,
            image_url    = image_url,
            tags         = tags,
            source_url   = source_url,
        )
        conn.execute(stmt)

print(f"✅ Seeded {len(recipes)} recipes")