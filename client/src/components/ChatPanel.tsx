import { useEffect, useRef, useState, type FormEvent } from 'react';
import * as Y from 'yjs';
import type { ChatMessage, UserColor } from '../lib/types';

type ChatPanelProps = {
  messages: Y.Array<Y.Map<unknown>>;
  doc: Y.Doc;
  author: string;
  userColor: UserColor;
};

function messageFromMap(map: Y.Map<unknown>): ChatMessage {
  return {
    id: (map.get('id') as string) ?? '',
    author: (map.get('author') as string) ?? '',
    color: (map.get('color') as string) ?? '#64748b',
    text: (map.get('text') as string) ?? '',
    createdAt: (map.get('createdAt') as number) ?? Date.now(),
  };
}

export function ChatPanel({ messages, doc, author, userColor }: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const [, bump] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handler = () => bump((n) => n + 1);
    messages.observe(handler);
    return () => messages.unobserve(handler);
  }, [messages]);

  const items = messages.toArray().map(messageFromMap);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [items.length]);

  const send = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    doc.transact(() => {
      const map = new Y.Map<unknown>();
      map.set('id', crypto.randomUUID());
      map.set('author', author);
      map.set('color', userColor.cursor);
      map.set('text', text);
      map.set('createdAt', Date.now());
      messages.push([map]);
    });

    setDraft('');
  };

  return (
    <aside className="chat-panel" aria-label="房间聊天">
      <h2>讨论区</h2>
      <ul ref={listRef} className="chat-list">
        {items.length === 0 && <li className="chat-empty">还没有消息，打个招呼吧 👋</li>}
        {items.map((msg) => (
          <li key={msg.id} className="chat-item">
            <span className="chat-author" style={{ color: msg.color }}>
              {msg.author}
            </span>
            <p>{msg.text}</p>
          </li>
        ))}
      </ul>
      <form className="chat-form" onSubmit={send}>
        <label className="sr-only" htmlFor="chat-input">
          发送消息
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="提问、分享、鼓励队友…"
          maxLength={500}
        />
        <button type="submit" className="btn-primary">
          发送
        </button>
      </form>
    </aside>
  );
}

type PresenceBarProps = {
  users: { name: string; color: UserColor }[];
  connected: boolean;
  synced: boolean;
  room: string;
  onLeave: () => void;
};

export function PresenceBar({ users, connected, synced, room, onLeave }: PresenceBarProps) {
  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', room);
    await navigator.clipboard.writeText(url.toString());
  };

  return (
    <header className="presence-bar">
      <div className="presence-left">
        <strong>房间 · {room}</strong>
        <span className={`status-dot${connected ? ' online' : ''}`} aria-hidden="true" />
        <span className="status-text">
          {connected ? (synced ? '已同步' : '同步中…') : '连接中…'}
        </span>
      </div>

      <div className="presence-users" aria-label={`在线 ${users.length} 人`}>
        {users.map((user) => (
          <span
            key={user.name + user.color.cursor}
            className="presence-chip"
            style={{ background: user.color.bg, color: user.color.text, borderColor: user.color.cursor }}
          >
            {user.name}
          </span>
        ))}
      </div>

      <div className="presence-actions">
        <button type="button" className="btn-ghost" onClick={() => void copyLink()}>
          复制链接
        </button>
        <button type="button" className="btn-ghost" onClick={onLeave}>
          离开
        </button>
      </div>
    </header>
  );
}
