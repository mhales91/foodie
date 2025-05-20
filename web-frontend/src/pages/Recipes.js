// src/pages/Recipes.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm]       = useState({
    name: '',
    ingredients: '',
    instructions: ''
  });
  const [message, setMessage] = useState(null);

  // Fetch all recipes on mount
  useEffect(() => {
    axios.get('http://localhost:8002/recipes')
      .then(res => setRecipes(res.data))
      .catch(() => setMessage('Failed to load recipes'));
  }, []);

  // Handle form input
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Submit new recipe
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // split ingredients by comma
      const ingredientsArr = form.ingredients.split(',').map(s => s.trim());
      await axios.post('http://localhost:8002/recipes', {
        name: form.name,
        ingredients: ingredientsArr,
        instructions: form.instructions
      });
      setForm({ name: '', ingredients: '', instructions: '' });
      // reload recipes
      const res = await axios.get('http://localhost:8002/recipes');
      setRecipes(res.data);
      setMessage('Recipe added!');
    } catch (err) {
      setMessage('Error adding recipe');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Recipes</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <div>
          <label>Name:</label><br/>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Ingredients (comma-separated):</label><br/>
          <input
            name="ingredients"
            value={form.ingredients}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Instructions:</label><br/>
          <textarea
            name="instructions"
            rows="3"
            value={form.instructions}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: 10 }}>
          Add Recipe
        </button>
      </form>

      <ul>
        {recipes.map(r => (
          <li key={r.id}>
            <strong>{r.name}</strong><br/>
            Ingredients: {r.ingredients.join(', ')}<br/>
            Instructions: {r.instructions}
          </li>
        ))}
      </ul>
    </div>
);
}