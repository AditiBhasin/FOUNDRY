import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { AGENT_CONFIGS } from '../state/startupState';

export default function IntelligenceCore({ interactive = true, size = 480, onNodeClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = size);
    let height = (canvas.height = size);
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    // Particles
    const particleCount = 75;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 0.8 + width / 2,
        y: (Math.random() - 0.5) * height * 0.8 + height / 2,
        z: Math.random() * 200 - 100,
        radius: Math.random() * 2 + 1,
        color: ['#00F0FF', '#38BDF8', '#8B5CF6', '#EC4899', '#10B981'][Math.floor(Math.random() * 5)],
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        orbitRadius: Math.random() * 120 + 60,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let tick = 0;
    const render = () => {
      tick += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      const centerX = width / 2 + (mouse.x - width / 2) * 0.15;
      const centerY = height / 2 + (mouse.y - height / 2) * 0.15;

      // Draw Orbit Rings
      const rings = [
        { r: 90, tilt: 0.35, rot: tick * 0.8, color: 'rgba(0, 240, 255, 0.4)' },
        { r: 135, tilt: -0.4, rot: -tick * 0.5, color: 'rgba(139, 92, 246, 0.35)' },
        { r: 175, tilt: 0.2, rot: tick * 0.3, color: 'rgba(2, 132, 199, 0.3)' },
      ];

      rings.forEach((ring) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(ring.rot);
        ctx.scale(1, ring.tilt);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // Draw Particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = centerX + Math.cos(p.angle) * p.orbitRadius;
        const py = centerY + Math.sin(p.angle) * (p.orbitRadius * 0.45);

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Glowing Center Core
      const corePulse = Math.sin(tick * 2) * 4;
      const coreRadius = 42 + corePulse;

      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, coreRadius * 1.5);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#00F0FF');
      gradient.addColorStop(0.7, '#8B5CF6');
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner Core Solid
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0f24';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fill();

      // Core Letter
      ctx.font = 'bold 22px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('F', centerX, centerY + 1);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive, size]);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: interactive ? 'pointer' : 'default',
        }}
      />
    </div>
  );
}
