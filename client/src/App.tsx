import { useMemo, useState } from 'react';
import { Lobby } from './components/Lobby';
import { Playground } from './components/Playground';
import { pickColor } from './lib/types';
import { useYjsRoom } from './lib/useYjsRoom';

function getInitialRoom(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') ?? 'learn-together';
}

export default function App() {
  const [session, setSession] = useState<{ room: string; name: string } | null>(null);
  const initialRoom = useMemo(() => getInitialRoom(), []);

  const room = useYjsRoom(session?.room ?? '', Boolean(session));

  const userColor = useMemo(() => {
    if (!session) return pickColor(0);
    let hash = 0;
    for (const char of session.name) hash = (hash + char.charCodeAt(0)) % 997;
    return pickColor(hash);
  }, [session]);

  const join = (roomId: string, name: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.replaceState({}, '', url.toString());
    setSession({ room: roomId, name });
  };

  const leave = () => {
    setSession(null);
  };

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
