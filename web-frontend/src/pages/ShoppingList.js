import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PreferencesContext } from '../context/PreferencesContext';
import './ShoppingList.css';

export default function ShoppingList() {
  const { selectedMeals, servingSize } = useContext(PreferencesContext);
  const [recipes, setRecipes] = useState([]);
  const [groupByRecipe, setGroupByRecipe] = useState(false);
  const [checked, setChecked] = useState({});
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

  // flatten counts by aisle
  const aisleCounts = meals
    .flatMap((m) => m.ingredients.map((ing) => ing.toLowerCase()))
    .reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + servingSize;
      return acc;
    }, {});

  const aisleItems = Object.entries(aisleCounts).map(([name, qty]) => ({
    name,
    qty,
  }));

  const handleCheck = (key) =>
    setChecked((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="shopping-list-page">
      <header className="shopping-header">
        <h2>Shopping List</h2>
        <div className="toggle-group">
          <button
            className={!groupByRecipe ? 'active' : ''}
            onClick={() => setGroupByRecipe(false)}
          >
            Aisle
          </button>
          <button
            className={groupByRecipe ? 'active' : ''}
            onClick={() => setGroupByRecipe(true)}
          >
            By Recipe
          </button>
        </div>
      </header>

      {groupByRecipe ? (
        meals.map((meal) => (
          <section key={meal.id}>
            <h3>{meal.name}</h3>
            <ul>
              {meal.ingredients.map((ing, i) => {
                const key = `${meal.id}-${i}`;
                return (
                  <li key={key}>
                    <label>
                      <input
                        type="checkbox"
                        checked={!!checked[key]}
                        onChange={() => handleCheck(key)}
                      />
                      {ing} ×{servingSize}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      ) : (
        <ul className="aisle-list">
          {aisleItems.map((it, i) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={!!checked[it.name]}
                  onChange={() => handleCheck(it.name)}
                />
                {it.name} — {it.qty}
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="shopping-actions">
        <button
          className="edit-plan-btn"
          onClick={() => navigate('/overview')}
        >
          Edit Meals
        </button>
        <button className="print-btn" onClick={() => window.print()}>
          Share / Print
        </button>
      </div>
    </div>
  );
}