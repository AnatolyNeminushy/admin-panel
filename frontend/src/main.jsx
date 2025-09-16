// src/main.jsx
// Точка входа приложения: монтирует корневой React-компонент в #root.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Корневой компонент приложения */}
    <App />
  </React.StrictMode>,
);
