import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@/app/styles/globals.css';
import {App} from '@/app';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
