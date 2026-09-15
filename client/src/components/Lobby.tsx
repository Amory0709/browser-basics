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
        <p className="eyebrow">Yjs 实时协作</p>
        <h1>一起玩，一起学</h1>
        <p className="subtitle">
          多人同屏：便签 brainstorm、白板涂鸦、实时光标、聊天讨论。打开同一个房间链接就能加入。
        </p>

        <form className="lobby-form" onSubmit={handleSubmit}>
          <label>
            昵称
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              required
              autoComplete="nickname"
              placeholder="给自己起个名字"
            />
          </label>

          <label>
            房间名
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              maxLength={48}
              required
              placeholder="例如 math-study"
            />
          </label>

          <button type="submit" className="btn-primary">
            进入房间
          </button>
        </form>

        <ul className="feature-list" aria-label="功能介绍">
          <li>📝 拖拽便签，多人同时编辑文字</li>
          <li>🎨 共享画板，一起涂涂画画</li>
          <li>👀 看到彼此光标，知道谁在做什么</li>
          <li>💬 侧边聊天，讨论问题</li>
        </ul>

        {room.trim() && (
          <p className="hint">
            分享链接：
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
