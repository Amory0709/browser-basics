import { useCallback, useEffect, useRef, useState } from 'react';
import type { YjsRoom } from '../lib/useYjsRoom';
import type { UserColor, Viewport } from '../lib/types';
import { useBoardViewport } from '../lib/useBoardViewport';
import { AdminControls, FollowBanner } from './AdminControls';
import { ChatPanel, PresenceBar } from './ChatPanel';
import { DrawingCanvas } from './DrawingCanvas';
import { LiveCursors } from './LiveCursors';
import { createStickyNote, StickyNotesLayer } from './StickyNotes';

type PlaygroundProps = {
  room: YjsRoom;
  roomId: string;
  userName: string;
  userColor: UserColor;
  onLeave: () => void;
};

function bindViewportCursorTracking(
  element: HTMLElement,
  viewport: Viewport,
  updateCursor: (x: number, y: number) => void,
): () => void {
  let frame = 0;
  let lastX = -1;
  let lastY = -1;

  const onMove = (event: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - viewport.x) / viewport.scale;
    const y = (event.clientY - rect.top - viewport.y) / viewport.scale;

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

export function Playground({ room, roomId, userName, userColor, onLeave }: PlaygroundProps) {
  const viewportHostRef = useRef<HTMLDivElement>(null);
  const boardContentRef = useRef<HTMLDivElement>(null);
  const [drawingActive, setDrawingActive] = useState(false);

  const onViewportChange = useCallback(
    (viewport: Viewport) => {
      room.updateAdminViewport(viewport);
    },
    [room.updateAdminViewport],
  );

  const { viewport, transformStyle, bindViewportControls, isFollowing } = useBoardViewport({
    isAdmin: room.isAdmin,
    shouldFollow: room.shouldFollow,
    remoteViewport: room.roomMetaState.adminViewport,
    onViewportChange,
  });

  useEffect(() => {
    room.setLocalUser(userName, userColor);
  }, [room, userName, userColor]);

  useEffect(() => {
    const host = viewportHostRef.current;
    if (!host) return;
    return bindViewportControls(host);
  }, [bindViewportControls]);

  useEffect(() => {
    const host = viewportHostRef.current;
    if (!host) return;

    return bindViewportCursorTracking(host, viewport, room.updateCursor);
  }, [room.updateCursor, viewport]);

  const addNote = () => {
    const host = viewportHostRef.current;
    const width = host?.clientWidth ?? 800;
    const height = host?.clientHeight ?? 600;
    const x = 40 + Math.random() * Math.max(80, width - 280);
    const y = 40 + Math.random() * Math.max(80, height - 240);
    createStickyNote(room.doc, room.notes, userName, userColor.bg, x, y);
  };

  const adminName = room.roomMetaState.adminName ?? userName;

  return (
    <div className="playground">
      <PresenceBar
        users={room.awarenessUsers}
        connected={room.connected}
        synced={room.synced}
        room={roomId}
        onLeave={onLeave}
      />

      <FollowBanner adminName={adminName} following={isFollowing} />

      <div className="playground-body">
        <main className="board-area">
          <div ref={viewportHostRef} className={`board-viewport${room.isAdmin ? ' admin-viewport' : ''}`}>
            <div ref={boardContentRef} className="board-content" style={transformStyle}>
              <DrawingCanvas
                strokes={room.strokes}
                doc={room.doc}
                active={drawingActive}
                onToggle={() => setDrawingActive((v) => !v)}
              />
              <StickyNotesLayer
                notes={room.notes}
                doc={room.doc}
                author={userName}
                userColor={userColor}
                onAddNote={addNote}
              />
              <LiveCursors
                users={room.awarenessUsers}
                localClientId={room.localClientId}
                containerRef={boardContentRef}
              />
            </div>
          </div>

          {room.isAdmin && (
            <AdminControls
              users={room.awarenessUsers}
              adminName={adminName}
              roomMeta={room.roomMetaState}
              followMap={room.followMap}
              onGlobalFollowChange={room.setGlobalFollow}
              onUserFollowChange={room.setUserFollow}
              onUserFollowReset={room.clearUserFollow}
            />
          )}
        </main>

        <ChatPanel
          messages={room.messages}
          doc={room.doc}
          author={userName}
          userColor={userColor}
        />
      </div>
    </div>
  );
}
