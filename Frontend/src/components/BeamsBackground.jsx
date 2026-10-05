import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// One grayscale light beam
function createBeam(width, height) {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    lightness: 70 + Math.random() * 25, // grayscale instead of hue
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

const OPACITY = { subtle: 0.7, medium: 0.85, strong: 1 };
const MIN_BEAMS = 13; // fewer beams = less per-frame work

export function BeamsBackground({ className, intensity = 'strong', children }) {
  const canvasRef = useRef(null);
  const beamsRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const resize = () => {
      // Cap pixel ratio — a 3x retina canvas has 9x the pixels to fill per frame
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = canvas.parentElement.clientWidth * dpr;
      canvas.height = canvas.parentElement.clientHeight * dpr;
      canvas.style.width = `${canvas.parentElement.clientWidth}px`;
      canvas.style.height = `${canvas.parentElement.clientHeight}px`;
      ctx.scale(dpr, dpr);
      const total = MIN_BEAMS * 1.5;
      beamsRef.current = Array.from({ length: total }, () => createBeam(canvas.width, canvas.height));
    };
    resize();
    window.addEventListener('resize', resize);

    const resetBeam = (beam, index, total) => {
      const column = index % 3;
      const spacing = canvas.width / 3;
      beam.y = canvas.height + 100;
      beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.lightness = 70 + Math.random() * 25;
      beam.opacity = 0.2 + Math.random() * 0.1;
      return beam;
    };

    const drawBeam = (beam) => {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);
      const pulsing = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * OPACITY[intensity];
      const g = ctx.createLinearGradient(0, 0, 0, beam.length);
      const stop = (a) => `hsla(0, 0%, ${beam.lightness}%, ${a})`;
      g.addColorStop(0, stop(0));
      g.addColorStop(0.1, stop(pulsing * 0.5));
      g.addColorStop(0.4, stop(pulsing));
      g.addColorStop(0.6, stop(pulsing));
      g.addColorStop(0.9, stop(pulsing * 0.5));
      g.addColorStop(1, stop(0));
      ctx.fillStyle = g;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    };

    const animate = () => {
      // No ctx.filter here anymore — that was re-blurring every pixel, every frame.
      // The softness now comes entirely from the cheap, GPU-composited CSS blur below.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const total = beamsRef.current.length;
      beamsRef.current.forEach((beam, i) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) resetBeam(beam, i, total);
        drawBeam(beam);
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Pause the animation when the tab isn't visible, so it doesn't burn
    // CPU/GPU in a background tab.
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameRef.current);
      } else {
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(frameRef.current);
    };
  }, [intensity]);

  return (
    <div className={cn('relative w-full overflow-hidden bg-neutral-950', className)}>
      <canvas ref={canvasRef} className="absolute inset-0" style={{ filter: 'blur(22px)' }} />
      <motion.div
        className="absolute inset-0 bg-neutral-950/5"
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
        style={{ backdropFilter: 'blur(50px)' }}
      />
      {children && <div className="relative z-10 flex h-full w-full items-center justify-center">{children}</div>}
    </div>
  );
}