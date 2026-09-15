import { useCallback, useEffect, useRef, useState } from 'react';
import type { Viewport } from './types';
import { DEFAULT_VIEWPORT } from './types';

const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

type UseBoardViewportOptions = {
  isAdmin: boolean;
  shouldFollow: boolean;
  adminViewport: Viewport | null;
  onViewportChange: (viewport: Viewport) => void;
};

export function useBoardViewport({
  isAdmin,
  shouldFollow,
  adminViewport,
  onViewportChange,
}: UseBoardViewportOptions) {
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const applyViewport = useCallback(
    (next: Viewport) => {
      viewportRef.current = next;
      setViewport(next);
      if (isAdmin) {
        onViewportChange(next);
      }
    },
    [isAdmin, onViewportChange],
  );

  useEffect(() => {
    if (!shouldFollow || !adminViewport) return;
    setViewport(adminViewport);
  }, [shouldFollow, adminViewport]);

  const bindViewportControls = useCallback(
    (element: HTMLElement | null) => {
      if (!element || !isAdmin) return () => undefined;

      let panning = false;
      let lastX = 0;
      let lastY = 0;

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const rect = element.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;
        const current = viewportRef.current;
        const direction = event.deltaY < 0 ? 1.08 : 0.92;
        const nextScale = clampScale(current.scale * direction);
        const scaleRatio = nextScale / current.scale;

        applyViewport({
          x: pointerX - (pointerX - current.x) * scaleRatio,
          y: pointerY - (pointerY - current.y) * scaleRatio,
          scale: nextScale,
        });
      };

      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 1 && !event.altKey) return;
        event.preventDefault();
        panning = true;
        lastX = event.clientX;
        lastY = event.clientY;
        element.setPointerCapture(event.pointerId);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!panning) return;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        const current = viewportRef.current;
        applyViewport({
          x: current.x + dx,
          y: current.y + dy,
          scale: current.scale,
        });
      };

      const onPointerUp = (event: PointerEvent) => {
        if (!panning) return;
        panning = false;
        element.releasePointerCapture(event.pointerId);
      };

      element.addEventListener('wheel', onWheel, { passive: false });
      element.addEventListener('pointerdown', onPointerDown);
      element.addEventListener('pointermove', onPointerMove);
      element.addEventListener('pointerup', onPointerUp);
      element.addEventListener('pointercancel', onPointerUp);

      return () => {
        element.removeEventListener('wheel', onWheel);
        element.removeEventListener('pointerdown', onPointerDown);
        element.removeEventListener('pointermove', onPointerMove);
        element.removeEventListener('pointerup', onPointerUp);
        element.removeEventListener('pointercancel', onPointerUp);
      };
    },
    [applyViewport, isAdmin],
  );

  const resetViewport = useCallback(() => {
    applyViewport(DEFAULT_VIEWPORT);
  }, [applyViewport]);

  const transformStyle = {
    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
    transformOrigin: '0 0',
  };

  return {
    viewport,
    transformStyle,
    bindViewportControls,
    resetViewport,
    isFollowing: shouldFollow,
  };
}
