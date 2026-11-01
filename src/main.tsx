import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { migrateLegacyKeys } from './lib/storage';
import './styles.css';

migrateLegacyKeys();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
