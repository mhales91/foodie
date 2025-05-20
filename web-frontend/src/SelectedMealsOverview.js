import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PreferencesContext } from '../context/PreferencesContext';
import './SelectedMealsOverview.css';

export default function SelectedMealsOverview() {
  const { selectedMeals, setSelectedMeals } = useContext(PreferencesContext);
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/recipes')
      .then((r) => r.json())
      .then(setRecipes)
      .catch(console.error);
  }, []);

  const meals = selectedMeals
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean);

  const handleReplace = (id) => {
    setSelectedMeals((prev) => prev.filter((x) => x !== id));
    navigate('/select-meals');
  };

  return (
    <div className="overview-page">
      <header className="overview-header">
        <h2>Selected Meals Overview</h2>
        <button className="edit-btn" onClick={() => navigate('/select-meals')}>
          Edit All
        </button>
      </header>

      <div className="meals-grid">
        {meals.map((meal) => (
          <div key={meal.id} className="meal-card">
            <img src={meal.image_url} alt={meal.name} className="meal-img" />
            <h3>{meal.name}</h3>
            <div className="tags">
              {meal.tags?.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <div className="overview-actions">
              <button
                className="view-btn"
                onClick={() => navigate(`/recipes/${meal.id}`)}
              >
                View Recipe
              </button>
              <button
                className="replace-btn"
                onClick={() => handleReplace(meal.id)}
              >
                Replace
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="gen-list-btn"
        onClick={() => navigate('/shopping-list')}
      >
        Generate Shopping List
      </button>
    </div>
  );
}