
'use client';
import { useEffect, useRef } from 'react';

export default function MotionBg() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { 
    // Placeholder for a real WebGL or 2D particle animation
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "hsl(var(--mk-bg-1))");
    grd.addColorStop(1, "hsl(var(--mk-bg-2))");
    
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    const handleResize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const newGrd = ctx.createLinearGradient(0, 0, w, h);
        newGrd.addColorStop(0, "hsl(var(--mk-bg-1))");
        newGrd.addColorStop(1, "hsl(var(--mk-bg-2))");
        ctx.fillStyle = newGrd;
        ctx.fillRect(0, 0, w, h);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, []);
  return <canvas ref={ref} className="absolute inset-0 -z-10 h-full w-full" aria-hidden />;
}
