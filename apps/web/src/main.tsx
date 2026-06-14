import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App.js';
import { initMarketTheme } from './lib/market-theme.js';
import { initSentry } from './lib/sentry.js';
import './styles/global.css';

initSentry();
initMarketTheme();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Elemento #root nao encontrado em index.html');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
