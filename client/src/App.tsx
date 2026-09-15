import { useMemo, useState } from 'react';
import { Lobby } from './components/Lobby';
import { Playground } from './components/Playground';
import { getAdminKeyFromUrl, isValidAdminKey, pickColor } from './lib/types';
import { useYjsRoom } from './lib/useYjsRoom';

function getInitialRoom(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') ?? 'learn-together';
}

export default function App() {
  const [session, setSession] = useState<{ room: string; name: string; adminKey: string | null } | null>(
    null,
  );
  const initialRoom = useMemo(() => getInitialRoom(), []);
  const initialAdminKey = useMemo(() => getAdminKeyFromUrl(), []);

  const room = useYjsRoom(
    session?.room ?? '',
    Boolean(session),
    session?.name ?? '',
    isValidAdminKey(session?.adminKey),
  );

  const userColor = useMemo(() => {
    if (!session) return pickColor(0);
    let hash = 0;
    for (const char of session.name) hash = (hash + char.charCodeAt(0)) % 997;
    return pickColor(hash);
  }, [session]);

  const join = (roomId: string, name: string, adminKey: string | null) => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    if (adminKey) {
      url.searchParams.set('admin', adminKey);
    } else {
      url.searchParams.delete('admin');
    }
    window.history.replaceState({}, '', url.toString());
    setSession({ room: roomId, name, adminKey });
  };

  const leave = () => {
    setSession(null);
  };

  if (!session || !room) {
    return <Lobby onJoin={join} initialRoom={initialRoom} initialAdminKey={initialAdminKey} />;
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
