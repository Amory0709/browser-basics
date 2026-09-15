import type { ChildMessage, ParentMessage } from './protocol.js';

type PostChild = (message: ChildMessage) => void;

export type TextChangeHandler = (text: string) => void;

export class SharedText {
  private text = '';
  private handlers = new Set<TextChangeHandler>();
  private subscribed = false;

  constructor(
    private readonly ns: string,
    private readonly post: PostChild,
  ) {}

  toString(): string {
    return this.text;
  }

  set(text: string): void {
    this.text = text;
    this.post({ type: 'TEXT_SET', ns: this.ns, text });
    this.emit();
  }

  observe(handler: TextChangeHandler): () => void {
    this.handlers.add(handler);
    if (!this.subscribed) {
      this.subscribed = true;
      this.post({ type: 'TEXT_SUB', ns: this.ns });
    }
    handler(this.text);
    return () => this.handlers.delete(handler);
  }

  handleParent(message: ParentMessage): void {
    if (message.type === 'TEXT_SNAPSHOT' && message.ns === this.ns) {
      this.text = message.text;
      this.emit();
    }
  }

  private emit(): void {
    for (const handler of this.handlers) handler(this.text);
  }
}
