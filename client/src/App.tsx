import { useEffect, useMemo, useState } from 'react';
import { Lobby } from './components/Lobby';
import { Playground } from './components/Playground';
import { bootstrapHostAccess } from './lib/hostAuth';
import { pickColor } from './lib/types';
import { useYjsRoom } from './lib/useYjsRoom';

function getInitialRoom(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') ?? 'learn-together';
}

export default function App() {
  const [session, setSession] = useState<{ room: string; name: string } | null>(null);
  const [hostGranted, setHostGranted] = useState(false);
  const [hostReady, setHostReady] = useState(false);
  const initialRoom = useMemo(() => getInitialRoom(), []);

  useEffect(() => {
    let active = true;

    void bootstrapHostAccess().then((granted) => {
      if (!active) return;
      setHostGranted(granted);
      setHostReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const room = useYjsRoom(session?.room ?? '', Boolean(session), session?.name ?? '', hostGranted);

  const userColor = useMemo(() => {
    if (!session) return pickColor(0);
    let hash = 0;
    for (const char of session.name) hash = (hash + char.charCodeAt(0)) % 997;
    return pickColor(hash);
  }, [session]);

  const join = (roomId: string, name: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    url.searchParams.delete('_hk');
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
    setSession({ room: roomId, name });
  };

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
    return <Lobby onJoin={join} initialRoom={initialRoom} />;
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
