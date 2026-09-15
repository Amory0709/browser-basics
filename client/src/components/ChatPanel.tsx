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
    <aside className="chat-panel" aria-label="Room chat">
      <h2>Chat</h2>
      <ul ref={listRef} className="chat-list">
        {items.length === 0 && <li className="chat-empty">No messages yet. Say hello!</li>}
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
          Send message
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask, share, cheer on teammates…"
          maxLength={500}
        />
        <button type="submit" className="btn-primary">
          Send
        </button>
      </form>
    </aside>
  );
}

type PresenceBarProps = {
  users: { name: string; color: UserColor; isAdmin?: boolean }[];
  connected: boolean;
  synced: boolean;
  room: string;
  isAdmin?: boolean;
  onLeave: () => void;
};

export function PresenceBar({ users, connected, synced, room, isAdmin = false, onLeave }: PresenceBarProps) {
  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', room);
    await navigator.clipboard.writeText(url.toString());
  };

  return (
    <header className="presence-bar">
      <div className="presence-left">
        <strong>Room · {room}</strong>
        {isAdmin && <span className="admin-badge">Admin</span>}
        <span className={`status-dot${connected ? ' online' : ''}`} aria-hidden="true" />
        <span className="status-text">
          {connected ? (synced ? 'Synced' : 'Syncing…') : 'Connecting…'}
        </span>
      </div>

      <div className="presence-users" aria-label={`${users.length} online`}>
        {users.map((user) => (
          <span
            key={user.name + user.color.cursor}
            className={`presence-chip${user.isAdmin ? ' presence-chip-admin' : ''}`}
            style={{ background: user.color.bg, color: user.color.text, borderColor: user.color.cursor }}
          >
            {user.name}
            {user.isAdmin ? ' · Admin' : ''}
          </span>
        ))}
      </div>

      <div className="presence-actions">
        <button type="button" className="btn-ghost" onClick={() => void copyLink()}>
          Copy link
        </button>
        <button type="button" className="btn-ghost" onClick={onLeave}>
          Leave
        </button>
      </div>
    </header>
  );
}
