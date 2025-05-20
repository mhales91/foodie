// src/components/Layout.js

import React from 'react';

export default function Layout({ children }) {
  return (
    // we keep the wrapper in case you want additional layout‐wide styling
    <div className="layout">
      {/* no more header/nav here */}
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}