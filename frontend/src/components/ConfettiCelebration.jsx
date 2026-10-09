import React, { useEffect, useRef } from 'react';

export default function ConfettiCelebration() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Confetti particles
    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444', '#FBBF24', '#06B6D4'];
    const particleCount = 120;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() * 200 - 100),
        y: height / 3 + (Math.random() * 100 - 50),
        r: Math.random() * 6 + 4,
        dx: (Math.random() - 0.5) * 14,
        dy: Math.random() * -12 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleInc: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        size: Math.random() * 8 + 6,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      let activeCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(frame * 0.02 + p.r) + 2 + p.r / 2) * 0.7 + p.dy * 0.2;
        p.x += Math.sin(frame * 0.02) * 2 + p.dx * 0.3;
        p.dy += 0.15; // Gravity
        p.dx *= 0.98; // Drag

        // Fade out slowly after descending
        if (p.y > height * 0.4) {
          p.opacity -= 0.005;
        }

        if (p.opacity > 0 && p.y < height + 50) {
          activeCount++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.beginPath();

          if (p.shape === 'rect') {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.tiltAngle);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          } else {
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      if (activeCount > 0 && frame < 360) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ top: 0, left: 0 }}
      aria-hidden="true"
    />
  );
}

