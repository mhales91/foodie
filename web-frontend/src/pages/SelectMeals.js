// src/pages/SelectMeals.js

import React, { useState, useEffect, useContext } from 'react';
import { useSwipeable }        from 'react-swipeable';
import { useNavigate, useParams } from 'react-router-dom';
import { PreferencesContext }  from '../context/PreferencesContext';
import './SelectMeals.css';

export default function SelectMeals() {
  const {
    mealsPerWeek,
    dietaryPreferences,
    selectedMeals,
    setSelectedMeals,
  } = useContext(PreferencesContext);

  const [recipes, setRecipes]         = useState([]);
  const [index, setIndex]             = useState(0);
  const [deltaX, setDeltaX]           = useState(0);
  const [celebrate, setCelebrate]     = useState(false);
  const [embeddedUrl, setEmbeddedUrl] = useState(null);
  const [isMobile, setIsMobile]       = useState(false);

  const { recipeId }                  = useParams();
  const navigate                      = useNavigate();
  const SWIPE_THRESHOLD               = 80;

  // detect mobile only on client
  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    setIsMobile(/Mobi|Android/i.test(ua));
  }, []);

  // fetch & filter recipes
  useEffect(() => {
    fetch('/recipes')
      .then(r => r.json())
      .then(data => {
        const filtered = dietaryPreferences.length
          ? data.filter(r =>
              dietaryPreferences.every(pref => r.tags?.includes(pref))
            )
          : data;
        setRecipes(filtered);
        // start at last index so you swipe backward
        setIndex(filtered.length > 1 ? filtered.length - 1 : 0);
      })
      .catch(console.error);
  }, [dietaryPreferences]);

  // celebrate when done
  useEffect(() => {
    if (selectedMeals.length === mealsPerWeek) {
      setCelebrate(true);
    }
  }, [selectedMeals, mealsPerWeek]);

  // if opened via /recipes/:recipeId, show overlay
  useEffect(() => {
    if (recipeId && recipes.length) {
      const r = recipes.find(r => r.id === recipeId);
      if (r?.source_url) {
        setEmbeddedUrl(r.source_url);
      }
    }
  }, [recipeId, recipes]);

  // view handler: embed on desktop, fallback to new tab on mobile
  const handleView = () => {
    const url = recipes[index]?.source_url;
    if (!url) return;
    if (isMobile) {
      window.open(url, '_blank');
    } else {
      navigate(`/recipes/${recipes[index].id}`);
    }
  };

  // swipe + tap handlers
  const handlers = useSwipeable({
    onSwiping:    ({ deltaX }) => setDeltaX(deltaX),
    onSwipedLeft: ({ deltaX }) => {
      if (deltaX < -SWIPE_THRESHOLD && index > 0) {
        setIndex(i => i - 1);
      }
      setDeltaX(0);
    },
    onSwipedRight: ({ deltaX }) => {
      if (
        deltaX > SWIPE_THRESHOLD &&
        index > 0 &&
        selectedMeals.length < mealsPerWeek
      ) {
        setSelectedMeals(s => [...s, recipes[index].id]);
        setIndex(i => i - 1);
      }
      setDeltaX(0);
    },
    onTap:      handleView,
    trackMouse: true,
    trackTouch: true,
    delta:      10,
  });

  if (!recipes.length) {
    return <div className="swipe-page">Loading…</div>;
  }

  const prev = index > 0 ? recipes[index - 1] : null;
  const curr = recipes[index];

  return (
    <div className={`swipe-page ${celebrate ? 'celebrate' : ''}`}>
      <header className="app-header">
        <h1 className="logo">Foodie</h1>
        <button
          className="settings-btn"
          onClick={() => navigate('/')}
          aria-label="Edit preferences"
        >⚙️</button>
      </header>

      <div className="card-area">
        {prev && (
          <div className="recipe-card next-card">
            <div
              className="card-image"
              style={{ backgroundImage: `url(${prev.image_url})` }}
            />
            <div className="card-content">
              <h3>{prev.name}</h3>
              {prev.subtitle && (
                <p className="card-subtitle">{prev.subtitle}</p>
              )}
              <div className="tags">
                {prev.tags?.map((t, i) => (
                  <span
                    key={i}
                    className={`tag ${
                      t.toLowerCase().includes('vegan') ? 'vegan' : ''
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          className="recipe-card main-card"
          {...handlers}
          onClick={handleView}
          style={{
            transform: `translate(-50%, -50%) translateX(${deltaX}px) rotate(${
              deltaX * 0.05
            }deg)`,
            transition: deltaX ? 'none' : 'transform 0.3s ease',
          }}
        >
          <div
            className="card-image"
            style={{ backgroundImage: `url(${curr.image_url})` }}
          />
          <div className="card-content">
            <h3>{curr.name}</h3>
            {curr.subtitle && (
              <p className="card-subtitle">{curr.subtitle}</p>
            )}
            <div className="tags">
              {curr.tags?.map((t, i) => (
                <span
                  key={i}
                  className={`tag ${
                    t.toLowerCase().includes('vegan') ? 'vegan' : ''
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {embeddedUrl && (
        <div className="iframe-overlay">
          <div className="iframe-box">
            <button
              className="iframe-close-btn"
              aria-label="Close recipe view"
              onClick={() => {
                setEmbeddedUrl(null);
                if (!isMobile) navigate('/select-meals');
              }}
            >
              ×
            </button>
            <iframe
              src={embeddedUrl}
              title="Recipe Detail"
            />
          </div>
        </div>
      )}

      <div
        className={`selected-meals-container ${
          selectedMeals.length === mealsPerWeek ? 'complete' : ''
        }`}
      >
        <div className="selected-meals">
          {Array.from({ length: mealsPerWeek }).map((_, i) => {
            const id   = selectedMeals[i];
            const meal = recipes.find(r => r.id === id);
            return meal ? (
              <div key={id} className="meal-chip">
                <div
                  className="meal-image"
                  style={{ backgroundImage: `url(${meal.image_url})` }}
                />
                <span className="meal-name">
                  {meal.name.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>
            ) : (
              <div key={i} className="meal-chip placeholder">
                <div className="placeholder-circle" />
              </div>
            );
          })}
        </div>
      </div>

      {selectedMeals.length === mealsPerWeek && (
        <div className="cta-container">
          <button
            className="cta-btn"
            onClick={() => navigate('/overview')}
          >
            Let’s get cookin'
          </button>
        </div>
      )}

      <nav className="bottom-nav">
        {/* … your nav buttons … */}
      </nav>
    </div>
  );
}