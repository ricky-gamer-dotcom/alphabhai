import { useEffect, useRef } from 'react';

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle, gentle floating aesthetic particles with smooth twinkle
    const particleCount = Math.min(Math.floor((width * height) / 22000), 40);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
      pulseSpeed: number;
      pulseOffset: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.5 + 0.6,
        baseAlpha: Math.random() * 0.35 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw faint, ultra-delicate connection web when particles drift near
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const lineAlpha = (1 - dist / 90) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw and update subtle twinkling star dust specks
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = Math.max(
          0.05,
          p.baseAlpha + Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.2
        );

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Pure Obsidian Black background */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* Subtle aesthetic drifting moonlit aura (pure monochrome glass atmosphere, NO orange) */}
      <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-white/[0.035] blur-[150px] animate-ambient-1 pointer-events-none" />
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-slate-400/[0.025] blur-[140px] animate-ambient-2 pointer-events-none" />
      <div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[550px] h-[450px] rounded-full bg-white/[0.025] blur-[150px] animate-ambient-1 pointer-events-none" />

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-75" />
    </div>
  );
}

