import { useCallback, useEffect, useRef, useState } from 'react';
import type { CollabRoom, Viewport } from '@browser-basics/yjs-room';
import { useBoardViewport } from '@browser-basics/yjs-room';
import type { UserColor } from '../lib/types';
import {
  createBoardEmbed,
  getBoardEmbeds,
  removeBoardEmbed,
  updateBoardEmbed,
  useBoardEmbeds,
} from '../lib/board-embeds';
import { AdminControls, FollowBanner } from './AdminControls';
import { EmbedHostFrame } from './EmbedHost';
import { PresenceBar } from '../../demo/components/ChatPanel';

type BoardProps = {
  room: CollabRoom;
  roomId: string;
  userName: string;
  userColor: UserColor;
  onLeave: () => void;
};

type DragState = {
  id: string;
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  originWidth: number;
  originHeight: number;
};

function newEmbedId(): string {
  return crypto.randomUUID();
}

export function Board({ room, roomId, userName, userColor, onLeave }: BoardProps) {
  const viewportHostRef = useRef<HTMLDivElement>(null);
  const normalizedEmbeds = useBoardEmbeds(room.doc);
  const [drag, setDrag] = useState<DragState | null>(null);

  const onViewportChange = useCallback(
    (viewport: Viewport) => {
      room.updatePresenterViewport(viewport);
    },
    [room.updatePresenterViewport],
  );

  const { viewport, transformStyle, bindViewportControls, isFollowing } = useBoardViewport({
    isPresenter: room.isPresenter,
    shouldFollow: room.shouldFollow,
    remoteViewport: room.roomMetaState.adminViewport,
    onViewportChange,
  });

  const interactiveEmbeds = room.isPresenter || room.roomMetaState.sessionMode === 'free';

  useEffect(() => {
    room.setLocalUser(userName, userColor);
  }, [room, userName, userColor]);

  useEffect(() => {
    const host = viewportHostRef.current;
    if (!host) return;
    return bindViewportControls(host);
  }, [bindViewportControls]);

  useEffect(() => {
    if (!drag) return;
    const embedsArray = getBoardEmbeds(room.doc);

    const onMove = (event: PointerEvent) => {
      const dx = (event.clientX - drag.startX) / viewport.scale;
      const dy = (event.clientY - drag.startY) / viewport.scale;

      if (drag.mode === 'move') {
        updateBoardEmbed(room.doc, embedsArray, drag.id, {
          x: drag.originX + dx,
          y: drag.originY + dy,
        });
        return;
      }

      updateBoardEmbed(room.doc, embedsArray, drag.id, {
        width: Math.max(240, drag.originWidth + dx),
        height: Math.max(180, drag.originHeight + dy),
      });
    };

    const onUp = () => setDrag(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, room.doc, viewport.scale]);

  const addHelloEmbed = () => {
    const embedsArray = getBoardEmbeds(room.doc);
    createBoardEmbed(room.doc, embedsArray, {
      id: newEmbedId(),
      url: '/courses/hello/index.html',
      x: 80 + normalizedEmbeds.length * 24,
      y: 80 + normalizedEmbeds.length * 24,
    });
  };

  const presenterName = room.roomMetaState.presenterName ?? userName;

  return (
    <div className="playground board-shell">
      <PresenceBar
        users={room.awarenessUsers}
        connected={room.connected}
        synced={room.synced}
        room={roomId}
        onLeave={onLeave}
      />

      <FollowBanner adminName={presenterName} following={isFollowing} />

      <div className="playground-body board-body">
        <main className="board-area">
          <div
            ref={viewportHostRef}
            className={`board-viewport${room.isPresenter ? ' admin-viewport' : ''}`}
          >
            <div className="board-content" style={transformStyle}>
              {normalizedEmbeds.map((embed) => (
                <div
                  key={embed.id}
                  className="board-embed-slot"
                  style={{
                    left: embed.x,
                    top: embed.y,
                    width: embed.width,
                    height: embed.height,
                    zIndex: embed.zIndex,
                  }}
                >
                  <EmbedHostFrame room={room} embed={embed} interactive={interactiveEmbeds} />
                  {room.isPresenter && (
                    <>
                      <button
                        type="button"
                        className="board-embed-remove"
                        aria-label="Remove embed"
                        onClick={() => removeBoardEmbed(room.doc, getBoardEmbeds(room.doc), embed.id)}
                      >
                        ×
                      </button>
                      <div
                        className="board-embed-drag-handle"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          setDrag({
                            id: embed.id,
                            mode: 'move',
                            startX: event.clientX,
                            startY: event.clientY,
                            originX: embed.x,
                            originY: embed.y,
                            originWidth: embed.width,
                            originHeight: embed.height,
                          });
                        }}
                      />
                      <div
                        className="board-embed-resize-handle"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          setDrag({
                            id: embed.id,
                            mode: 'resize',
                            startX: event.clientX,
                            startY: event.clientY,
                            originX: embed.x,
                            originY: embed.y,
                            originWidth: embed.width,
                            originHeight: embed.height,
                          });
                        }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {room.isPresenter && (
            <AdminControls
              users={room.awarenessUsers}
              adminName={presenterName}
              roomMeta={room.roomMetaState}
              followMap={room.followMap}
              onSessionModeChange={room.setSessionMode}
              onUserFollowChange={room.setUserFollow}
              onUserFollowReset={room.clearUserFollow}
              onAddHelloEmbed={addHelloEmbed}
            />
          )}
        </main>
      </div>
    </div>
  );
}
