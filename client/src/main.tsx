import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { configureCollabRoom } from '@browser-basics/yjs-room';
import './index.css';
import App from './App.tsx';

configureCollabRoom({
  getWsUrl: () => {
    const fromEnv = import.meta.env.VITE_WS_URL as string | undefined;
    if (fromEnv) return fromEnv;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    return `${protocol}//${host}:1234`;
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
