import { useEffect, useRef } from 'react';

interface HeroProps {
  onScrollDown: () => void;
}

// Lightweight canvas particle system — pure JS, no deps
function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;

    const PARTICLE_COUNT = 80;
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; da: number };
    let particles: Particle[] = [];

    function resize() {
      canvas!.width  = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x:     Math.random() * canvas!.width,
        y:     Math.random() * canvas!.height,
        vx:    (Math.random() - 0.5) * 0.3,
        vy:    (Math.random() - 0.5) * 0.3,
        r:     Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        da:    (Math.random() - 0.5) * 0.003,
      }));
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(61, 68, 96, ${(1 - dist / 120) * 0.4})`;
            ctx!.lineWidth = 0.5;
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.da;
        if (p.alpha <= 0.05 || p.alpha >= 0.55) p.da *= -1;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(124, 106, 247, ${p.alpha})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    init();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasRef]);
}

export function Hero({ onScrollDown }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleCanvas(canvasRef);

  return (
    <section
      className="relative flex min-h-[calc(100vh-52px)] flex-col items-center justify-center overflow-hidden"
      aria-label="Devkit Directory"
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* Bottom gradient fade into page */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        style={{ background: 'linear-gradient(to bottom, transparent, #0f1117)' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">

        {/* Eyebrow label */}
        <div className="hero-line hero-line-1 mb-10 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-border-default" aria-hidden="true" />
          <span className="text-xs font-medium tracking-[0.25em] text-text-muted uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}>
            Open Source Directory
          </span>
          <div className="h-px w-12 bg-border-default" aria-hidden="true" />
        </div>

        {/* Main headline — DM Serif Display */}
        <h1
          className="hero-line hero-line-2 text-text-primary"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
          }}
        >
          Every tool that
        </h1>

        {/* Italic serif accent line */}
        <div className="hero-line hero-line-3 relative inline-block">
          <h1
            className="text-text-primary"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #e8eaf0 0%, #9ba3bf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            extends Claude.
          </h1>
          {/* Animated underline */}
          <div
            className="hero-underline absolute -bottom-1 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, #7c6af7, #4fa3e0)' }}
            aria-hidden="true"
          />
        </div>

        {/* Sub-copy */}
        <p
          className="hero-line hero-line-4 mx-auto mt-10 max-w-lg text-text-secondary"
          style={{ fontSize: '1.0625rem', lineHeight: 1.7 }}
        >
          A curated, open-source directory of Claude skills and MCP servers.
          Browse, filter, and discover what's possible.
        </p>

        {/* CTAs */}
        <div className="hero-line hero-line-5 mt-12 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onScrollDown}
            className="group relative overflow-hidden rounded-full border border-accent-primary/40 bg-accent-primary/10 px-7 py-3 text-sm font-medium text-accent-primary backdrop-blur-sm transition-all duration-300 hover:bg-accent-primary hover:text-white hover:border-accent-primary hover:shadow-lg hover:shadow-accent-primary/20"
          >
            Browse directory
          </button>
          <a
            href="https://github.com/your-org/devkit"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border-subtle px-7 py-3 text-sm font-medium text-text-muted transition-all duration-300 hover:border-border-default hover:text-text-secondary"
          >
            View on GitHub ↗
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        onClick={onScrollDown}
        aria-label="Scroll to directory"
        className="scroll-cue absolute bottom-8 left-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-text-secondary"
        style={{ transform: 'translateX(-50%)' }}
      >
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          scroll
        </span>
        <svg width="1" height="32" viewBox="0 0 1 32" aria-hidden="true">
          <line x1="0.5" y1="0" x2="0.5" y2="32" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      </button>
    </section>
  );
}
