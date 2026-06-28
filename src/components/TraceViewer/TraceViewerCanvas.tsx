import { useEffect, useRef } from 'react';
import type { TraceStep } from '@/types/trace';

interface Props {
  currentStep: TraceStep | null;
  allSteps: TraceStep[];
  currentStepIndex: number;
}

const TraceViewerCanvas = ({ currentStep }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(55, 65, 81, 0.3)';
      ctx.lineWidth = 0.5;
      const step = 40;
      for (let x = 0; x <= canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    };

    const drawViz = () => {
      if (!currentStep || !currentStep.locals) return;
      const keys = [...Object.keys(currentStep.locals), ...Object.keys(currentStep.globals ?? {})];
      if (keys.length === 0) return;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = Math.min(canvas.width, canvas.height) * 0.35;

      keys.forEach((key, i) => {
        const angle = (2 * Math.PI * i) / keys.length - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(109, 40, 217, 0.3)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 154, 32, 0.85)'; ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.font = '11px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(key, x, y + 22);
        const val = currentStep.locals[key] ?? currentStep.globals?.[key];
        const valStr = val !== undefined ? String(val).slice(0, 12) : '?';
        ctx.fillStyle = '#F59E0B'; ctx.font = 'bold 10px monospace';
        ctx.fillText(valStr, x, y + 36);
      });

      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      grad.addColorStop(0, 'rgba(109, 40, 217, 0.9)'); grad.addColorStop(1, 'rgba(109, 40, 217, 0.4)');
      ctx.fillStyle = grad; ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(currentStep.function || 'main', cx, cy);
    };

    const render = () => {
      ctx.fillStyle = '#030712'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGrid(); drawViz();
      animId = requestAnimationFrame(render);
    };

    resize(); render();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, [currentStep]);

  return (
    <div ref={containerRef} className="h-full w-full relative" style={{ background: '#030712', borderRadius: 8, overflow: 'hidden' }}>
      {!currentStep && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>点击分析以开始</p>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

export default TraceViewerCanvas;
