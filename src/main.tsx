
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { supabase } from './integrations/supabase/client';

// Make Supabase available in the browser console during development
if (import.meta.env.DEV) {
  window.supabase = supabase;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
