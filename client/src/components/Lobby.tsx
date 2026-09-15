import { useState, type FormEvent } from 'react';
import { getShareUrl, pickColor } from '../lib/types';

import { getPreferredDisplayName } from '../lib/sessionPrefs';

type LobbyProps = {
  onJoin: (room: string, name: string) => void;
  initialRoom?: string;
  hostGranted?: boolean;
  hostRejected?: boolean;
};

export function Lobby({
  onJoin,
  initialRoom = 'learn-together',
  hostGranted = false,
  hostRejected = false,
}: LobbyProps) {
  const [room, setRoom] = useState(initialRoom);
  const [name, setName] = useState(() => getPreferredDisplayName());

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedRoom = room.trim();
    const trimmedName = name.trim();
    if (!trimmedRoom || !trimmedName) return;
    onJoin(trimmedRoom, trimmedName);
  };

  return (
    <div className="lobby">
      <div className="lobby-card">
        <div className="lobby-brand">
          <img src="/favicon.svg" alt="" className="lobby-logo" width={32} height={32} />
          <p className="eyebrow">Real-time collaboration</p>
        </div>
        <h1>Learn together</h1>
        <p className="subtitle">
          Shared canvas for courses, whiteboard, and live presence. One link, instant sync.
        </p>

        {hostGranted && (
          <p className="presenter-banner" role="status">
            Presenter session active — you can control the room after joining.
          </p>
        )}

        {hostRejected && (
          <p className="presenter-error" role="alert">
            Presenter link is invalid or the server is not configured. You can still join as a
            participant.
          </p>
        )}

        <form className="lobby-form" onSubmit={handleSubmit}>
          <label>
            Display name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              required
              autoComplete="nickname"
              placeholder="Pick a name"
            />
          </label>

          <label>
            Room name
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              maxLength={48}
              required
              placeholder="e.g. math-study"
            />
          </label>

          <button type="submit" className="btn-primary">
            Join room
          </button>
        </form>

        <ul className="feature-list" aria-label="Features">
          <li>Collaborative sticky notes</li>
          <li>Shared whiteboard drawing</li>
          <li>Live cursors and presence</li>
          <li>Side chat for discussion</li>
        </ul>

        {room.trim() && (
          <p className="hint">
            Share link:
            <code>{getShareUrl(room.trim())}</code>
          </p>
        )}

        <p className="color-preview" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} style={{ background: pickColor(i).cursor }} />
          ))}
        </p>
      </div>
    </div>
  );
}
