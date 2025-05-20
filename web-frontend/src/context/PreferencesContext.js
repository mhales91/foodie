import React, { createContext, useState, useEffect } from 'react';

export const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const [mealsPerWeek, setMealsPerWeek]             = useState(5);
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [shoppingDay, setShoppingDay]               = useState('Saturday');
  const [servingSize, setServingSize]               = useState(4);
  const [allergens, setAllergens]                   = useState([]);
  const [selectedMeals, setSelectedMeals]           = useState([]);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('preferences'));
    if (saved) {
      if (saved.mealsPerWeek)           setMealsPerWeek(saved.mealsPerWeek);
      if (saved.dietaryPreferences)     setDietaryPreferences(saved.dietaryPreferences);
      if (saved.shoppingDay)            setShoppingDay(saved.shoppingDay);
      if (saved.servingSize)            setServingSize(saved.servingSize);
      if (saved.allergens)              setAllergens(saved.allergens);
      if (saved.selectedMeals)          setSelectedMeals(saved.selectedMeals);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(
      'preferences',
      JSON.stringify({
        mealsPerWeek,
        dietaryPreferences,
        shoppingDay,
        servingSize,
        allergens,
        selectedMeals,
      })
    );
  }, [mealsPerWeek, dietaryPreferences, shoppingDay, servingSize, allergens, selectedMeals]);

  return (
    <PreferencesContext.Provider
      value={{
        mealsPerWeek,
        setMealsPerWeek,
        dietaryPreferences,
        setDietaryPreferences,
        shoppingDay,
        setShoppingDay,
        servingSize,
        setServingSize,
        allergens,
        setAllergens,
        selectedMeals,
        setSelectedMeals,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}