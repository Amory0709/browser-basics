import { useEffect, useRef, useState } from 'react';
import type { YjsRoom } from '../lib/useYjsRoom';
import type { UserColor } from '../lib/types';
import { ChatPanel, PresenceBar } from './ChatPanel';
import { DrawingCanvas } from './DrawingCanvas';
import { bindCursorTracking, LiveCursors } from './LiveCursors';
import { createStickyNote, StickyNotesLayer } from './StickyNotes';

type PlaygroundProps = {
  room: YjsRoom;
  roomId: string;
  userName: string;
  userColor: UserColor;
  onLeave: () => void;
};

export function Playground({ room, roomId, userName, userColor, onLeave }: PlaygroundProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [drawingActive, setDrawingActive] = useState(false);

  useEffect(() => {
    room.setLocalUser(userName, userColor);
  }, [room, userName, userColor]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    return bindCursorTracking(board, room.updateCursor);
  }, [room]);

  const addNote = () => {
    const board = boardRef.current;
    const width = board?.clientWidth ?? 800;
    const height = board?.clientHeight ?? 600;
    const x = 40 + Math.random() * Math.max(80, width - 280);
    const y = 40 + Math.random() * Math.max(80, height - 240);
    createStickyNote(room.doc, room.notes, userName, userColor.bg, x, y);
  };

  return (
    <div className="playground">
      <PresenceBar
        users={room.awarenessUsers}
        connected={room.connected}
        synced={room.synced}
        room={roomId}
        onLeave={onLeave}
      />

      <div className="playground-body">
        <main className="board-area">
          <div ref={boardRef} className="board">
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
              containerRef={boardRef}
            />
          </div>
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
