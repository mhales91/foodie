// src/pages/Signup.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName]   = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/users', {
        email,
        display_name: name
      });
      // Store the new user ID and go to onboarding
      localStorage.setItem('userId', res.data.id);
      navigate('/onboarding');
    } catch (err) {
      setResult({
        success: false,
        error: err.response?.data || err.message
      });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Name: </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <button type="submit" style={{ marginTop: 20 }}>
          Create User
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 20 }}>
          {result.success
            ? <pre>{JSON.stringify(result.data, null, 2)}</pre>
            : <pre style={{ color: 'red' }}>{JSON.stringify(result.error, null, 2)}</pre>}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Link to="/">← Back to Home</Link>
      </div>
    </div>
  );
}