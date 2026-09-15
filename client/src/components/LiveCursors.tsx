import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import type { AwarenessUser } from '../lib/types';

type LiveCursorsProps = {
  users: AwarenessUser[];
  localClientId: number;
  containerRef: React.RefObject<HTMLElement | null>;
};

export function LiveCursors({ users, localClientId, containerRef }: LiveCursorsProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const layer = layerRef.current;
    if (!container || !layer) return;

    const syncSize = () => {
      const rect = container.getBoundingClientRect();
      layer.style.width = `${rect.width}px`;
      layer.style.height = `${rect.height}px`;
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <div ref={layerRef} className="live-cursors" aria-hidden="true">
      {users
        .filter((user) => user.clientId !== localClientId && user.cursor)
        .map((user) => (
          <div
            key={user.clientId}
            className="remote-cursor"
            style={{
              transform: `translate(${user.cursor!.x}px, ${user.cursor!.y}px)`,
              color: user.color.cursor,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.5 3.21l12.01 8.64a1 1 0 01-.08 1.67l-4.18 2.45 2.45 4.18a1 1 0 01-1.67.08L5.5 3.21z" />
            </svg>
            <span style={{ background: user.color.cursor }}>{user.name}</span>
          </div>
        ))}
    </div>
  );
}

export function bindCursorTracking(
  element: HTMLElement,
  updateCursor: (x: number, y: number) => void,
): () => void {
  let frame = 0;
  let lastX = -1;
  let lastY = -1;

  const onMove = (event: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x === lastX && y === lastY) return;
    lastX = x;
    lastY = y;

    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => updateCursor(x, y));
  };

  const onLeave = () => {
    updateCursor(-9999, -9999);
  };

  element.addEventListener('mousemove', onMove);
  element.addEventListener('mouseleave', onLeave);

  return () => {
    cancelAnimationFrame(frame);
    element.removeEventListener('mousemove', onMove);
    element.removeEventListener('mouseleave', onLeave);
  };
}

export function readYText(textMap: Y.Map<unknown>): string {
  const text = textMap.get('text');
  if (text instanceof Y.Text) return text.toString();
  return typeof textMap.get('text') === 'string' ? (textMap.get('text') as string) : '';
}

export function writeYText(doc: Y.Doc, textMap: Y.Map<unknown>, value: string) {
  const existing = textMap.get('text');
  if (!(existing instanceof Y.Text)) {
    doc.transact(() => {
      textMap.set('text', new Y.Text(value));
    });
    return;
  }

  doc.transact(() => {
    const current = existing.toString();
    if (current !== value) {
      existing.delete(0, current.length);
      existing.insert(0, value);
    }
  });
}

export function observeYText(textMap: Y.Map<unknown>, onChange: (value: string) => void): () => void {
  const text = textMap.get('text');
  if (!(text instanceof Y.Text)) {
    onChange('');
    return () => undefined;
  }

  const handler = () => onChange(text.toString());
  text.observe(handler);
  handler();
  return () => text.unobserve(handler);
}
