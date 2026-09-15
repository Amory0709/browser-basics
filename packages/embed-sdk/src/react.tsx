import { useEffect, useState } from 'react';
import type { EmbedClient, EmbedContext } from './client.js';
import type { EmbedSessionMode } from './protocol.js';
import type { SharedMap } from './shared-map.js';

export function useEmbedReady(client: EmbedClient | null): EmbedContext | null {
  const [ctx, setCtx] = useState<EmbedContext | null>(null);

  useEffect(() => {
    if (!client) {
      setCtx(null);
      return;
    }
    let active = true;
    void client.ready().then((ready) => {
      if (active) setCtx(ready);
    });
    return () => {
      active = false;
    };
  }, [client]);

  return ctx;
}

export function useEmbedMap(ctx: EmbedContext | null, name: string): Map<string, unknown> {
  const [entries, setEntries] = useState<Map<string, unknown>>(new Map());

  useEffect(() => {
    if (!ctx) {
      setEntries(new Map());
      return;
    }
    const map: SharedMap = ctx.getMap(name);
    return map.observe(setEntries);
  }, [ctx, name]);

  return entries;
}

export function useSessionMode(ctx: EmbedContext | null): EmbedSessionMode {
  const [mode, setMode] = useState<EmbedSessionMode>('free');

  useEffect(() => {
    if (!ctx) {
      setMode('free');
      return;
    }
    return ctx.onSessionMode(setMode);
  }, [ctx]);

  return mode;
}
