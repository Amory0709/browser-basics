import type { ChildMessage, ParentMessage } from './protocol.js';

type PostChild = (message: ChildMessage) => void;

export type MapChangeHandler = (entries: Map<string, unknown>) => void;

export class SharedMap {
  private entries = new Map<string, unknown>();
  private handlers = new Set<MapChangeHandler>();
  private subscribed = false;

  constructor(
    private readonly ns: string,
    private readonly post: PostChild,
  ) {}

  get(key: string): unknown {
    return this.entries.get(key);
  }

  set(key: string, value: unknown): void {
    this.entries.set(key, value);
    this.post({ type: 'MAP_SET', ns: this.ns, key, value });
    this.emit();
  }

  delete(key: string): void {
    this.entries.delete(key);
    this.post({ type: 'MAP_DEL', ns: this.ns, key });
    this.emit();
  }

  entriesSnapshot(): Map<string, unknown> {
    return new Map(this.entries);
  }

  observe(handler: MapChangeHandler): () => void {
    this.handlers.add(handler);
    if (!this.subscribed) {
      this.subscribed = true;
      this.post({ type: 'MAP_SUB', ns: this.ns });
    }
    handler(this.entriesSnapshot());
    return () => this.handlers.delete(handler);
  }

  handleParent(message: ParentMessage): void {
    if (message.type === 'MAP_SNAPSHOT' && message.ns === this.ns) {
      this.entries = new Map(Object.entries(message.entries));
      this.emit();
      return;
    }
    if (message.type === 'MAP_KEY' && message.ns === this.ns) {
      if (message.value === null) this.entries.delete(message.key);
      else this.entries.set(message.key, message.value);
      this.emit();
    }
  }

  private emit(): void {
    const snapshot = this.entriesSnapshot();
    for (const handler of this.handlers) handler(snapshot);
  }
}
