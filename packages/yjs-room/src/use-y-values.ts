import { useEffect, useState } from 'react';
import type * as Y from 'yjs';

export function useYMapValues<T>(map: Y.Map<unknown> | null): Map<string, T> {
  const [, bump] = useState(0);

  useEffect(() => {
    if (!map) return;
    const handler = () => bump((n) => n + 1);
    map.observeDeep(handler);
    return () => map.unobserveDeep(handler);
  }, [map]);

  if (!map) return new Map();

  const result = new Map<string, T>();
  map.forEach((value, key) => {
    result.set(key, value as T);
  });
  return result;
}

export function useYArrayValues<T>(array: Y.Array<unknown> | null): T[] {
  const [, bump] = useState(0);

  useEffect(() => {
    if (!array) return;
    const handler = () => bump((n) => n + 1);
    array.observe(handler);
    return () => array.unobserve(handler);
  }, [array]);

  if (!array) return [];
  return array.toArray() as T[];
}
