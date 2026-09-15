import { useState, type FormEvent } from 'react';
import { getShareUrl, isValidAdminKey, pickColor, randomName } from '../lib/types';

type LobbyProps = {
  onJoin: (room: string, name: string, adminKey: string | null) => void;
  initialRoom?: string;
  initialAdminKey?: string | null;
};

export function Lobby({ onJoin, initialRoom = 'learn-together', initialAdminKey = null }: LobbyProps) {
  const [room, setRoom] = useState(initialRoom);
  const [name, setName] = useState(() => randomName());
  const [adminKey, setAdminKey] = useState(initialAdminKey ?? '');
  const [joinAsAdmin, setJoinAsAdmin] = useState(Boolean(initialAdminKey));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedRoom = room.trim();
    const trimmedName = name.trim();
    if (!trimmedRoom || !trimmedName) return;
    const key = joinAsAdmin ? adminKey.trim() : '';
    if (joinAsAdmin && !isValidAdminKey(key)) {
      window.alert('Invalid admin key');
      return;
    }
    onJoin(trimmedRoom, trimmedName, joinAsAdmin ? key : null);
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

          <label className="admin-join-toggle">
            <input
              type="checkbox"
              checked={joinAsAdmin}
              onChange={(e) => setJoinAsAdmin(e.target.checked)}
            />
            <span>Join as admin</span>
          </label>

          {joinAsAdmin && (
            <label>
              Admin key
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                autoComplete="off"
              />
            </label>
          )}

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
