import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [step, setStep] = useState(1);
  const [size, setSize] = useState(1);
  const [prefs, setPrefs] = useState([]);
  const options = ['Vegan','Vegetarian','Gluten-Free','Dairy-Free'];

  const togglePref = opt =>
    setPrefs(p => p.includes(opt)
      ? p.filter(x => x !== opt)
      : [...p, opt]
    );

  const submitProfile = async () => {
    await axios.post('http://localhost:8001/profiles', {
      user_id: userId,
      household_size: size,
      dietary_preferences: prefs
    });
    navigate('/');
  };

  return (
    <div style={{ padding: 20 }}>
      {step===1 && (
        <>
          <h2>Household size?</h2>
          <input
            type="number" min="1" value={size}
            onChange={e=>setSize(Number(e.target.value))}
          />
          <button onClick={()=>setStep(2)} style={{ marginTop:20 }}>
            Next
          </button>
        </>
      )}
      {step===2 && (
        <>
          <h2>Dietary Preferences</h2>
          {options.map(opt=>(
            <button
              key={opt}
              onClick={()=>togglePref(opt)}
              style={{
                margin:5,
                background: prefs.includes(opt)?'#007AFF':'#EEE',
                color:     prefs.includes(opt)?'#FFF':'#000',
              }}
            >
              {opt}
            </button>
          ))}
          <div style={{ marginTop:20 }}>
            <button onClick={submitProfile}>Finish Onboarding</button>
          </div>
        </>
      )}
    </div>
  );
}