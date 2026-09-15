import type { ChildMessage } from './protocol.js';
import * as Y from 'yjs';

function readYMap(value: unknown): Y.Map<unknown> | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || typeof (value as Y.Map<unknown>).get !== 'function') {
    return null;
  }
  return value as Y.Map<unknown>;
}

function readYText(value: unknown): Y.Text | null {
  if (value === undefined || value === null) return null;
  if (
    typeof value !== 'object' ||
    typeof (value as Y.Text).toString !== 'function' ||
    typeof (value as Y.Text).insert !== 'function'
  ) {
    return null;
  }
  return value as Y.Text;
}

export function getEmbedRoot(doc: Y.Doc, embedId: string): Y.Map<unknown> {
  const embeds = doc.getMap('embeds');
  const existing = readYMap(embeds.get(embedId));
  if (existing) return existing;
  const created = new Y.Map();
  embeds.set(embedId, created);
  return created;
}

export function getSharedRoot(doc: Y.Doc, embedId: string): Y.Map<unknown> {
  const embed = getEmbedRoot(doc, embedId);
  const existing = readYMap(embed.get('shared'));
  if (existing) return existing;
  const created = new Y.Map();
  embed.set('shared', created);
  return created;
}

export function getSharedYMap(doc: Y.Doc, embedId: string, ns: string): Y.Map<unknown> {
  const shared = getSharedRoot(doc, embedId);
  const existing = readYMap(shared.get(ns));
  if (existing) return existing;
  const created = new Y.Map();
  shared.set(ns, created);
  return created;
}

export function getSharedYText(doc: Y.Doc, embedId: string, ns: string): Y.Text {
  const shared = getSharedRoot(doc, embedId);
  const existing = readYText(shared.get(ns));
  if (existing) return existing;
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
