// src/pages/Plan.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Plan() {
  const userId = localStorage.getItem('userId');
  const [recipes, setRecipes]     = useState([]);
  const [plans, setPlans]         = useState([]);
  const [weekStart, setWeekStart] = useState('');
  const [selected, setSelected]   = useState(new Set());
  const [msg, setMsg]             = useState(null);

  // Fetch all recipes and the current user's plans on mount
  useEffect(() => {
    axios.get('http://localhost:8002/recipes')
      .then(res => setRecipes(res.data))
      .catch(() => setMsg('Failed to load recipes'));

    if (userId) {
      axios.get(`http://localhost:8003/plans/${userId}`)
        .then(res => setPlans(res.data))
        .catch(() => setMsg('Failed to load plans'));
    }
  }, [userId]);

  // Toggle selection of a recipe ID
  const toggle = id => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  };

  // Create a new plan
  const submit = async e => {
    e.preventDefault();
    if (!weekStart || selected.size === 0) {
      setMsg('Pick a date and at least one recipe');
      return;
    }
    try {
      await axios.post('http://localhost:8003/plans', {
        user_id:   userId,
        week_start: weekStart,
        recipes:   Array.from(selected),
      });
      setMsg('Plan created!');
      // Refresh the plan list
      const res = await axios.get(`http://localhost:8003/plans/${userId}`);
      setPlans(res.data);
      setSelected(new Set());
    } catch {
      setMsg('Error creating plan');
    }
  };

  // Helper: look up recipe name by ID
  const nameById = id => {
    const r = recipes.find(x => x.id === id);
    return r ? r.name : id;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Meal Plans</h2>
      {msg && <p>{msg}</p>}

      <form onSubmit={submit} style={{ marginBottom: 40 }}>
        <div>
          <label>Week Start: </label>
          <input
            type="date"
            value={weekStart}
            onChange={e => setWeekStart(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Select Recipes:</label>
          <div>
            {recipes.map(r => (
              <label key={r.id} style={{ marginRight: 10 }}>
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggle(r.id)}
                />
                {r.name}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" style={{ marginTop: 10 }}>
          Create Plan
        </button>
      </form>

      <h3>Your Plans</h3>
      {plans.map(p => (
        <div
          key={p.id}
          style={{
            marginBottom: 20,
            border: '1px solid #eee',
            padding: 10
          }}
        >
          <strong>{p.week_start}</strong>
          <ul>
            {p.recipes.map(rid => (
              <li key={rid}>{nameById(rid)}</li>
            ))}
          </ul>
          <Link to={`/shopping-list/${p.id}`}>
            View Shopping List
          </Link>
        </div>
      ))}
    </div>
  );
}