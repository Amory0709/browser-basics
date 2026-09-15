import * as Y from 'yjs';

function isYMap(value: unknown): value is Y.Map<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Y.Map<unknown>).get === 'function' &&
    typeof (value as Y.Map<unknown>).set === 'function'
  );
}

function isYText(value: unknown): value is Y.Text {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Y.Text).toString === 'function' &&
    typeof (value as Y.Text).insert === 'function'
  );
}

function isYArray(value: unknown): value is Y.Array<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Y.Array<unknown>).toArray === 'function' &&
    typeof (value as Y.Array<unknown>).push === 'function'
  );
}

export function getEmbedRoot(doc: Y.Doc, embedId: string): Y.Map<unknown> {
  const embeds = doc.getMap('embeds');
  const existing = embeds.get(embedId);
  if (isYMap(existing)) return existing;
  const created = new Y.Map();
  embeds.set(embedId, created);
  return created;
}

export function getSharedRoot(doc: Y.Doc, embedId: string): Y.Map<unknown> {
  const embed = getEmbedRoot(doc, embedId);
  const existing = embed.get('shared');
  if (isYMap(existing)) return existing;
  const created = new Y.Map();
  embed.set('shared', created);
  return created;
}

export function getSharedYMap(doc: Y.Doc, embedId: string, ns: string): Y.Map<unknown> {
  const shared = getSharedRoot(doc, embedId);
  const existing = shared.get(ns);
  if (isYMap(existing)) return existing;
  const created = new Y.Map();
  shared.set(ns, created);
  return created;
}

export function getSharedYText(doc: Y.Doc, embedId: string, ns: string): Y.Text {
  const shared = getSharedRoot(doc, embedId);
  const existing = shared.get(ns);
  if (isYText(existing)) return existing;
  const created = new Y.Text();
  shared.set(ns, created);
  return created;
}

export function mapEntriesRecord(map: Y.Map<unknown>): Record<string, unknown> {
  const entries: Record<string, unknown> = {};
  map.forEach((value, key) => {
    entries[key] = value;
  });
  return entries;
}

import type { ChildMessage } from './protocol.js';

export function applyChildMessage(
  doc: Y.Doc,
  embedId: string,
  message: ChildMessage,
): { kind: 'map' | 'text'; ns: string } | null {
  if (message.type === 'MAP_SET') {
    doc.transact(() => {
      getSharedYMap(doc, embedId, message.ns).set(message.key, message.value);
    });
    return { kind: 'map', ns: message.ns };
  }
  if (message.type === 'MAP_DEL') {
    doc.transact(() => {
      getSharedYMap(doc, embedId, message.ns).delete(message.key);
    });
    return { kind: 'map', ns: message.ns };
  }
  if (message.type === 'TEXT_SET') {
    doc.transact(() => {
      const text = getSharedYText(doc, embedId, message.ns);
      text.delete(0, text.length);
      text.insert(0, message.text);
    });
    return { kind: 'text', ns: message.ns };
  }
  return null;
}

export { isYArray, isYMap };
