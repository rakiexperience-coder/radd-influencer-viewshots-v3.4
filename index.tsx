/**
 * RADD Influencer ViewShots App
 * Copyright (c) 2025 Raki AI Digital DEN
 * ALL rights reserved.
 *
 * Licensed under the RADD Proprietary License.
 * Unauthorized copying, modification, distribution, or use
 * of this software, via any medium, is strictly prohibited
 * without prior written permission from Raki AI Digital DEN.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);