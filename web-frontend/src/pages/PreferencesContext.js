import React, { createContext, useState, useEffect } from 'react';

export const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  // load saved or default prefs
  const [mealsPerWeek, setMealsPerWeek] = useState(7);
  const [dietaryPreferences, setDietaryPreferences] = useState([]);

  // on mount, hydrate from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('preferences'));
    if (saved) {
      setMealsPerWeek(saved.mealsPerWeek);
      setDietaryPreferences(saved.dietaryPreferences);
    }
  }, []);

  // whenever prefs change, persist
  useEffect(() => {
    localStorage.setItem(
      'preferences',
      JSON.stringify({ mealsPerWeek, dietaryPreferences })
    );
  }, [mealsPerWeek, dietaryPreferences]);

  return (
    <PreferencesContext.Provider
      value={{ mealsPerWeek, dietaryPreferences, setMealsPerWeek, setDietaryPreferences }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}