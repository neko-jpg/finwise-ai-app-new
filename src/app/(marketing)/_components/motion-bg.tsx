
'use client';
import { useEffect, useRef } from 'react';

export default function MotionBg() {
  const ref = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => { 
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const drawGradient = () => {
      let w = canvas.width = window.innerWidth;
      let h = canvas.height = window.innerHeight;
      
      const rootStyle = getComputedStyle(document.documentElement);
      // CSS variables are defined in globals.css for the marketing theme
      const color1Hsl = rootStyle.getPropertyValue('--mk-bg-1-hsl').trim();
      const color2Hsl = rootStyle.getPropertyValue('--mk-bg-2-hsl').trim();
      
      const grd = ctx.createLinearGradient(0, 0, w, h);
      grd.addColorStop(0, `hsl(${color1Hsl})`);
      grd.addColorStop(1, `hsl(${color2Hsl})`);
      
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    }

    drawGradient();

    window.addEventListener('resize', drawGradient);
    return () => window.removeEventListener('resize', drawGradient);

  }, []);
  
  return <canvas ref={ref} className="absolute inset-0 -z-10 h-full w-full" aria-hidden />;
}
