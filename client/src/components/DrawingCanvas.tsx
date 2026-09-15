import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import type { DrawStroke } from '../lib/types';

const COLORS = ['#111827', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

type DrawingCanvasProps = {
  strokes: Y.Array<Y.Map<unknown>>;
  doc: Y.Doc;
  active: boolean;
  onToggle: () => void;
};

function strokeFromMap(map: Y.Map<unknown>): DrawStroke {
  return {
    id: (map.get('id') as string) ?? '',
    color: (map.get('color') as string) ?? '#111827',
    width: (map.get('width') as number) ?? 3,
    points: (map.get('points') as number[]) ?? [],
  };
}

export function DrawingCanvas({ strokes, doc, active, onToggle }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, bump] = useState(0);
  const drawing = useRef(false);
  const currentStroke = useRef<Y.Map<unknown> | null>(null);
  const [color, setColor] = useState(COLORS[0]!);
  const [width, setWidth] = useState(3);

  useEffect(() => {
    const handler = () => bump((n) => n + 1);
    strokes.observe(handler);
    return () => strokes.unobserve(handler);
  }, [strokes]);

  const allStrokes = strokes.toArray().map(strokeFromMap);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redraw(ctx, allStrokes);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [allStrokes]);

  const redraw = (ctx: CanvasRenderingContext2D, data: DrawStroke[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (const stroke of data) {
      if (stroke.points.length < 4) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0]!, stroke.points[1]!);
      for (let i = 2; i < stroke.points.length; i += 2) {
        ctx.lineTo(stroke.points[i]!, stroke.points[i + 1]!);
      }
      ctx.stroke();
    }
  };

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active) return;
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const { x, y } = getPoint(event);

    doc.transact(() => {
      const strokeMap = new Y.Map<unknown>();
      strokeMap.set('id', crypto.randomUUID());
      strokeMap.set('color', color);
      strokeMap.set('width', width);
      strokeMap.set('points', [x, y]);
      strokes.push([strokeMap]);
      currentStroke.current = strokeMap;
    });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active || !drawing.current || !currentStroke.current) return;
    const { x, y } = getPoint(event);
    doc.transact(() => {
      const points = (currentStroke.current!.get('points') as number[]) ?? [];
      currentStroke.current!.set('points', [...points, x, y]);
    });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false;
    currentStroke.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const clearBoard = () => {
    doc.transact(() => {
      strokes.delete(0, strokes.length);
    });
  };

  return (
    <div className="drawing-panel">
      <div className="drawing-toolbar">
        <button
          type="button"
          className={active ? 'btn-toggle active' : 'btn-toggle'}
          onClick={onToggle}
          aria-pressed={active}
        >
          {active ? '✏️ 正在涂鸦' : '🖊️ 开启涂鸦'}
        </button>

        <fieldset className="color-picker" disabled={!active}>
          <legend className="sr-only">画笔颜色</legend>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={color === c ? 'swatch active' : 'swatch'}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`颜色 ${c}`}
              aria-pressed={color === c}
            />
          ))}
        </fieldset>

        <label className="width-slider">
          粗细
          <input
            type="range"
            min={2}
            max={12}
            value={width}
            disabled={!active}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </label>

        <button type="button" className="btn-ghost" onClick={clearBoard}>
          清空画板
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className={active ? 'drawing-canvas active' : 'drawing-canvas'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="共享涂鸦画板"
      />
    </div>
  );
}
