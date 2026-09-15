import { createRoot } from 'react-dom/client';
import { configureCollabRoom } from '@browser-basics/yjs-room';
import './index.css';
import App from './App.tsx';

function wsBaseToHttp(base: string): string {
  return base.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
}

configureCollabRoom({
  getWsUrl: () => {
    const fromEnv = import.meta.env.VITE_WS_URL as string | undefined;
    if (fromEnv) return fromEnv;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (import.meta.env.DEV) {
      return `${protocol}//${window.location.host}/yjs`;
    }

    return `${protocol}//${window.location.hostname}:1234`;
  },
  getHostVerifyUrl: () => {
    const fromEnv = import.meta.env.VITE_WS_URL as string | undefined;
    if (fromEnv) return `${wsBaseToHttp(fromEnv)}/api/host-verify`;
    return `${window.location.origin}/api/host-verify`;
  },
});

createRoot(document.getElementById('root')!).render(<App />);
