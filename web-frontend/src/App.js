// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';

import Preferences           from './pages/Preferences';
import SelectMeals           from './pages/SelectMeals';
import SelectedMealsOverview from './pages/SelectedMealsOverview';
import ShoppingList          from './pages/ShoppingList';
import Recipes               from './pages/Recipes';
import Plan                  from './pages/Plan';
import Profile               from './pages/Profile';

export default function App() {
  return (
    <PreferencesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                     element={<Preferences />} />
          <Route path="/select-meals"         element={<SelectMeals />} />
          <Route path="/overview"             element={<SelectedMealsOverview />} />
          <Route path="/shopping-list"        element={<ShoppingList />} />
          <Route path="/recipes"              element={<Recipes />} />
          { /* Deep-link into a recipe from SelectMeals */ }
          <Route path="/recipes/:recipeId"    element={<SelectMeals />} />
          <Route path="/plans"                element={<Plan />} />
          <Route path="/profile"              element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </PreferencesProvider>
  );
}