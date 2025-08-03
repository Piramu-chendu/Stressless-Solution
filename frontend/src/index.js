import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom'; // Keep Router here
import reportWebVitals from './reportWebVitals'; // Adjusted this line

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* Only wrap with Router here */}
      <App />
    </Router>
  </React.StrictMode>
);

reportWebVitals();
