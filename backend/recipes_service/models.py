# C:\...\recipes_service\models.py

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Recipe(Base):
    __tablename__ = "recipes"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    subtitle    = Column(String)
    image_url   = Column(String)
    servings    = Column(String)
    prep_time   = Column(String)
    cook_time   = Column(String)
    description = Column(Text)

    ingredients  = relationship("Ingredient", back_populates="recipe", cascade="all, delete")
    instructions = relationship("Instruction", back_populates="recipe", cascade="all, delete")
    nutrition    = relationship("Nutrition", uselist=False, back_populates="recipe", cascade="all, delete")

class Ingredient(Base):
    __tablename__ = "ingredients"
    id        = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    name      = Column(String)
    quantity  = Column(String)
    unit      = Column(String)
    section   = Column(String)

    recipe = relationship("Recipe", back_populates="ingredients")

class Instruction(Base):
    __tablename__ = "instructions"
    id        = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    step      = Column(Integer)
    text      = Column(Text)

    recipe = relationship("Recipe", back_populates="instructions")

class Nutrition(Base):
    __tablename__ = "nutrition"
    id        = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    energy    = Column(String)
    protein   = Column(String)
    fat       = Column(String)
    sat_fat   = Column(String)
    carbs     = Column(String)
    fibre     = Column(String)
    sodium    = Column(String)
    iron      = Column(String)
    zinc      = Column(String)
    vit_b12   = Column(String)

    recipe = relationship("Recipe", back_populates="nutrition")