import { useEffect, useRef } from 'react';
import type { CollabRoom } from '@browser-basics/yjs-room';
import { createEmbedHost, type EmbedHost } from '@browser-basics/embed-sdk';
import type { BoardEmbed } from '../lib/board-embeds';

type EmbedHostFrameProps = {
  room: CollabRoom;
  embed: BoardEmbed;
  interactive: boolean;
};

export function EmbedHostFrame({ room, embed, interactive }: EmbedHostFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hostRef = useRef<EmbedHost | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const host = createEmbedHost({
      doc: room.doc,
      embedId: embed.id,
      role: room.isPresenter ? 'presenter' : 'participant',
      sessionMode: room.roomMetaState.sessionMode,
      iframe,
    });
    hostRef.current = host;

    return () => {
      host.destroy();
      hostRef.current = null;
    };
  }, [embed.id, room.doc, room.isPresenter]);

  useEffect(() => {
    hostRef.current?.setSessionMode(room.roomMetaState.sessionMode);
  }, [room.roomMetaState.sessionMode]);

  const src = `${embed.url}${embed.url.includes('?') ? '&' : '?'}embedId=${encodeURIComponent(embed.id)}`;

  return (
    <iframe
      ref={iframeRef}
      className="board-embed-frame"
      title={`Course embed ${embed.id}`}
      src={src}
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
    />
  );
}
