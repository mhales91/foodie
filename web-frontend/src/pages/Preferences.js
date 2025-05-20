// src/pages/Preferences.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PreferencesContext } from '../context/PreferencesContext';
import './Preferences.css';

export default function Preferences() {
  const {
    mealsPerWeek, setMealsPerWeek,
    servingSize, setServingSize,
  } = useContext(PreferencesContext);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate('/select-meals');
  }

  return (
    <div className="preferences-page">
      <h1>Setup Your Preferences</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Meals per week:
          <input
            type="number"
            min="1"
            max="14"
            value={mealsPerWeek}
            onChange={e => setMealsPerWeek(+e.target.value)}
          />
        </label>
        <label>
          Serving size:
          <input
            type="number"
            min="1"
            value={servingSize}
            onChange={e => setServingSize(+e.target.value)}
          />
        </label>
        <button type="submit">Next →</button>
      </form>
    </div>
  );
}