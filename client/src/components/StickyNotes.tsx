import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import type { UserColor } from '../lib/types';
import { USER_COLORS } from '../lib/types';
import { observeYText, readYText, writeYText } from './LiveCursors';

type StickyNoteProps = {
  noteMap: Y.Map<unknown>;
  doc: Y.Doc;
  author: string;
  onDelete: () => void;
  onMove: (x: number, y: number) => void;
};

export function StickyNote({ noteMap, doc, author, onDelete, onMove }: StickyNoteProps) {
  const [text, setText] = useState(() => readYText(noteMap));
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);

  const x = (noteMap.get('x') as number) ?? 0;
  const y = (noteMap.get('y') as number) ?? 0;
  const color = (noteMap.get('color') as string) ?? USER_COLORS[0]!.bg;
  const noteAuthor = (noteMap.get('author') as string) ?? author;

  useEffect(() => observeYText(noteMap, setText), [noteMap]);

  const handlePointerDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest('textarea, button')) return;
    const rect = noteRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setDragging(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragging) return;
    const board = noteRef.current?.offsetParent as HTMLElement | null;
    if (!board) return;

    const boardRect = board.getBoundingClientRect();
    const nextX = Math.max(0, Math.min(event.clientX - boardRect.left - dragOffset.current.x, boardRect.width - 220));
    const nextY = Math.max(0, Math.min(event.clientY - boardRect.top - dragOffset.current.y, boardRect.height - 180));
    onMove(nextX, nextY);
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    setDragging(false);
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  };

  return (
    <div
      ref={noteRef}
      className={`sticky-note${dragging ? ' dragging' : ''}`}
      style={{ left: x, top: y, background: color }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <header>
        <span>{noteAuthor}</span>
        <button type="button" onClick={onDelete} aria-label="Delete note">
          ×
        </button>
      </header>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          writeYText(doc, noteMap, e.target.value);
        }}
        placeholder="Ideas, questions, or key points…"
        aria-label="Note content"
      />
    </div>
  );
}

type StickyNotesLayerProps = {
  notes: Y.Map<Y.Map<unknown>>;
  doc: Y.Doc;
  author: string;
  userColor: UserColor;
  onAddNote: () => void;
};

export function StickyNotesLayer({ notes, doc, author, userColor, onAddNote }: StickyNotesLayerProps) {
  const [, bump] = useState(0);

  useEffect(() => {
    const handler = () => bump((n) => n + 1);
    notes.observe(handler);
    return () => notes.unobserve(handler);
  }, [notes]);

  const entries = Array.from(notes.entries());

  return (
    <>
      {entries.map(([id, noteMap]) => (
        <StickyNote
          key={id}
          noteMap={noteMap}
          doc={doc}
          author={author}
          onDelete={() => {
            doc.transact(() => notes.delete(id));
          }}
          onMove={(x, y) => {
            doc.transact(() => {
              noteMap.set('x', x);
              noteMap.set('y', y);
            });
          }}
        />
      ))}
      <button
        type="button"
        className="fab-add-note"
        onClick={onAddNote}
        style={{ borderColor: userColor.cursor, color: userColor.text }}
        aria-label="Add note"
      >
        + Note
      </button>
    </>
  );
}

export function createStickyNote(doc: Y.Doc, notes: Y.Map<Y.Map<unknown>>, author: string, color: string, x: number, y: number) {
  const id = crypto.randomUUID();
  doc.transact(() => {
    const noteMap = new Y.Map<unknown>();
    noteMap.set('x', x);
    noteMap.set('y', y);
    noteMap.set('color', color);
    noteMap.set('author', author);
    noteMap.set('text', new Y.Text(''));
    notes.set(id, noteMap);
  });
}
