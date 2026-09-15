import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import type { DrawStroke } from '../lib/types';

const COLORS = ['#111827', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

type DrawingCanvasProps = {
  strokes: Y.Array<Y.Map<unknown>>;
  doc: Y.Doc;
  active: boolean;
  onToggle: () => void;
};

function readPoints(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.filter((point): point is number => typeof point === 'number');
  }
  return [];
}

function strokeFromMap(map: Y.Map<unknown>): DrawStroke {
  return {
    id: (map.get('id') as string) ?? '',
    color: (map.get('color') as string) ?? '#111827',
    width: (map.get('width') as number) ?? 3,
    points: readPoints(map.get('points')),
  };
}

function drawStrokes(ctx: CanvasRenderingContext2D, data: DrawStroke[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const stroke of data) {
    if (stroke.points.length < 2) continue;

    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.points.length === 2) {
      ctx.beginPath();
      ctx.arc(stroke.points[0]!, stroke.points[1]!, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0]!, stroke.points[1]!);
    for (let i = 2; i < stroke.points.length; i += 2) {
      ctx.lineTo(stroke.points[i]!, stroke.points[i + 1]!);
    }
    ctx.stroke();
  }
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
    strokes.observeDeep(handler);
    return () => strokes.unobserveDeep(handler);
  }, [strokes]);

  const allStrokes = strokes.toArray().map(strokeFromMap);

  const redraw = useCallback(
    (data: DrawStroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawStrokes(ctx, data);
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
      redraw(allStrokes);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [allStrokes, redraw]);

  useEffect(() => {
    redraw(allStrokes);
  }, [allStrokes, redraw]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = rect.width > 0 ? event.currentTarget.width / rect.width : 1;
    const scaleY = rect.height > 0 ? event.currentTarget.height / rect.height : 1;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
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
      const points = readPoints(currentStroke.current!.get('points'));
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
          {active ? '✏️ Drawing' : '🖊️ Start drawing'}
        </button>

        <fieldset className="color-picker" disabled={!active}>
          <legend className="sr-only">Brush color</legend>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={color === c ? 'swatch active' : 'swatch'}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
            />
          ))}
        </fieldset>

        <label className="width-slider">
          Width
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
          Clear board
        </button>

        {!active && <span className="drawing-hint">Click &quot;Start drawing&quot; to draw on the board</span>}
      </div>

      <canvas
        ref={canvasRef}
        className={active ? 'drawing-canvas active' : 'drawing-canvas'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Shared drawing board"
      />
    </div>
  );
}
