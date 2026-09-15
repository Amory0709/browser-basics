import { useEffect, useState } from 'react';
import * as Y from 'yjs';

export type BoardEmbed = {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

function isYMap(value: unknown): value is Y.Map<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Y.Map<unknown>).get === 'function' &&
    typeof (value as Y.Map<unknown>).set === 'function'
  );
}

export function getBoardEmbeds(doc: Y.Doc): Y.Array<unknown> {
  const board = doc.getMap('board');
  const existing = board.get('embeds');
  if (existing !== undefined && existing !== null) {
    return existing as Y.Array<unknown>;
  }
  const created = new Y.Array();
  board.set('embeds', created);
  return created;
}

export function readBoardEmbed(value: unknown): BoardEmbed | null {
  if (!isYMap(value)) return null;
  const id = value.get('id');
  const url = value.get('url');
  if (typeof id !== 'string' || typeof url !== 'string') return null;
  return {
    id,
    url,
    x: typeof value.get('x') === 'number' ? (value.get('x') as number) : 0,
    y: typeof value.get('y') === 'number' ? (value.get('y') as number) : 0,
    width: typeof value.get('width') === 'number' ? (value.get('width') as number) : 480,
    height: typeof value.get('height') === 'number' ? (value.get('height') as number) : 320,
    zIndex: typeof value.get('zIndex') === 'number' ? (value.get('zIndex') as number) : 1,
  };
}

export function listBoardEmbeds(embeds: Y.Array<unknown>): BoardEmbed[] {
  return embeds
    .toArray()
    .map(readBoardEmbed)
    .filter((entry): entry is BoardEmbed => entry !== null);
}

export function createBoardEmbed(
  doc: Y.Doc,
  embeds: Y.Array<unknown>,
  partial: Pick<BoardEmbed, 'id' | 'url'> & Partial<BoardEmbed>,
): void {
  doc.transact(() => {
    const entry = new Y.Map<unknown>();
    entry.set('id', partial.id);
    entry.set('url', partial.url);
    entry.set('x', partial.x ?? 80);
    entry.set('y', partial.y ?? 80);
    entry.set('width', partial.width ?? 480);
    entry.set('height', partial.height ?? 320);
    entry.set('zIndex', partial.zIndex ?? embeds.length + 1);
    embeds.push([entry]);
  });
}

export function updateBoardEmbed(
  doc: Y.Doc,
  embeds: Y.Array<unknown>,
  id: string,
  patch: Partial<BoardEmbed>,
): void {
  doc.transact(() => {
    for (let i = 0; i < embeds.length; i++) {
      const entry = embeds.get(i);
      if (!isYMap(entry) || entry.get('id') !== id) continue;
      if (patch.x !== undefined) entry.set('x', patch.x);
      if (patch.y !== undefined) entry.set('y', patch.y);
      if (patch.width !== undefined) entry.set('width', patch.width);
      if (patch.height !== undefined) entry.set('height', patch.height);
      if (patch.zIndex !== undefined) entry.set('zIndex', patch.zIndex);
      if (patch.url !== undefined) entry.set('url', patch.url);
      return;
    }
  });
}

export function useBoardEmbeds(doc: Y.Doc): BoardEmbed[] {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const board = doc.getMap('board');
    const bump = () => setRevision((n) => n + 1);
    board.observeDeep(bump);
    return () => board.unobserveDeep(bump);
  }, [doc]);

  void revision;
  return listBoardEmbeds(getBoardEmbeds(doc));
}

export function removeBoardEmbed(doc: Y.Doc, embeds: Y.Array<unknown>, id: string): void {
  doc.transact(() => {
    for (let i = 0; i < embeds.length; i++) {
      const entry = embeds.get(i);
      if (isYMap(entry) && entry.get('id') === id) {
        embeds.delete(i, 1);
        return;
      }
    }
  });
}
