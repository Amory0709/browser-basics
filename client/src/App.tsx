import { useCallback, useEffect, useMemo, useState } from 'react';
import { bootstrapHostAccess, stripHostKeyFromUrl, useCollabRoom } from '@browser-basics/yjs-room';
import { Lobby } from './components/Lobby';
import { Playground } from './components/Playground';
import { getPreferredDisplayName, savePreferredDisplayName } from './lib/sessionPrefs';
import { pickColor } from './lib/types';

function getRoomFromUrl(): string | null {
  const room = new URLSearchParams(window.location.search).get('room')?.trim();
  return room || null;
}

export default function App() {
  const [session, setSession] = useState<{ room: string; name: string } | null>(null);
  const [hostGranted, setHostGranted] = useState(false);
  const [hostRejected, setHostRejected] = useState(false);
  const [hostReady, setHostReady] = useState(false);
  const initialRoom = useMemo(() => getRoomFromUrl() ?? 'learn-together', []);

  useEffect(() => {
    let active = true;

    void bootstrapHostAccess().then((result) => {
      if (!active) return;
      setHostGranted(result.granted);
      setHostRejected(result.rejectedKey);
      setHostReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const room = useCollabRoom({
    roomId: session?.room ?? '',
    enabled: Boolean(session),
    userName: session?.name ?? '',
    hostGranted,
  });

  const userColor = useMemo(() => {
    if (!session) return pickColor(0);
    let hash = 0;
    for (const char of session.name) hash = (hash + char.charCodeAt(0)) % 997;
    return pickColor(hash);
  }, [session]);

  const join = useCallback((roomId: string, name: string) => {
    savePreferredDisplayName(name);
    stripHostKeyFromUrl();
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.replaceState({}, '', url.toString());
    setSession({ room: roomId, name });
  }, []);

  useEffect(() => {
    if (!hostReady || session) return;

    const roomId = getRoomFromUrl();
    if (!roomId) return;

    join(roomId, getPreferredDisplayName());
  }, [hostReady, session, join]);

  const leave = () => {
    setSession(null);
  };

  if (!hostReady) {
    return (
      <div className="lobby">
        <div className="lobby-card">
          <p className="subtitle">Loading room…</p>
        </div>
      </div>
    );
  }

  if (!session || !room) {
    return (
      <Lobby
        onJoin={join}
        initialRoom={initialRoom}
        hostGranted={hostGranted}
        hostRejected={hostRejected}
      />
    );
  }

  return (
    <Playground
      room={room}
      roomId={session.room}
      userName={session.name}
      userColor={userColor}
      onLeave={leave}
    />
  );
}
