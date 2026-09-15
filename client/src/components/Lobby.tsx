import { useState, type FormEvent } from 'react';
import { getShareUrl, pickColor, randomName } from '../lib/types';

type LobbyProps = {
  onJoin: (room: string, name: string) => void;
  initialRoom?: string;
};

export function Lobby({ onJoin, initialRoom = 'learn-together' }: LobbyProps) {
  const [room, setRoom] = useState(initialRoom);
  const [name, setName] = useState(() => randomName());

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
        <p className="eyebrow">Yjs real-time collaboration</p>
        <h1>Learn together, play together</h1>
        <p className="subtitle">
          Multiplayer canvas: sticky notes, whiteboard drawing, live cursors, and chat. Share one room
          link and jump in.
        </p>

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
          <li>📝 Drag sticky notes and edit together</li>
          <li>🎨 Shared whiteboard drawing</li>
          <li>👀 See live cursors from everyone</li>
          <li>💬 Side chat for discussion</li>
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
