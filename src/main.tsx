
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { supabase } from './integrations/supabase/client';

// Make Supabase available in the browser console during development
if (import.meta.env.DEV) {
  // Use a safer way to expose supabase to the window object
  Object.defineProperty(window, 'supabase', {
    value: supabase,
    writable: false
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
