// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [message, setMessage] = useState('Loading…');

  useEffect(() => {
    axios.get('http://localhost:8000/')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage('Cannot connect to backend'));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Family Meal Planner</h1>
      <p><strong>Backend says:</strong> {message}</p>
      <Link to="/signup">Go to Signup</Link>
    </div>
  );
}