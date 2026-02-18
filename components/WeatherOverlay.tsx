
import React, { useEffect, useRef } from 'react';
import { WeatherType } from '../types';

interface WeatherOverlayProps {
  type: WeatherType;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

interface RayData {
  angle: number;
  width: number;
  length: number;
  opacity: number;
  speed: number;
  offset: number;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ type, cardRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raysRef = useRef<RayData[]>([]);

  // Initialize rays once for a stable "diamond shine" effect
  useEffect(() => {
    const rayCount = 12;
    const data: RayData[] = [];
    for (let i = 0; i < rayCount; i++) {
      data.push({
        angle: (Math.PI * 0.3) + (i * (Math.PI * 0.7) / rayCount),
        width: 100 + Math.random() * 150,
        length: 1.5, // multiplier for canvas width
        opacity: 0.05 + Math.random() * 0.1,
        speed: 0.0001 + Math.random() * 0.0002, // Extremely slow movement
        offset: Math.random() * Math.PI * 2
      });
    }
    raysRef.current = data;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    let landedParticles: { x: number; y: number; size: number; opacity: number; life: number }[] = [];
    let splashes: { x: number; y: number; vx: number; vy: number; life: number; opacity: number }[] = [];
    let startTime = performance.now();
    
    // Determine particle count based on weather type
    let particleCount = 90;
    if (type === WeatherType.STORM) particleCount = 140;
    else if (type === WeatherType.CLEAR) particleCount = 25;
    else if (type === WeatherType.SNOW) particleCount = 850; // BLIZZARD INTENSITY
    else if (type === WeatherType.LIGHT_SNOW) particleCount = 150; // Gentle Snow
    else if (type === WeatherType.RAIN) particleCount = 200;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedY: number = 0;
      speedX: number = 0;
      opacity: number = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = type === WeatherType.CLEAR ? Math.random() * canvas!.height : -50 - Math.random() * 200;
        this.opacity = Math.random() * 0.3 + 0.1;

        switch (type) {
          case WeatherType.SNOW: // Heavy Snow (Blizzard)
            this.size = Math.random() * 4 + 2; // Large flakes
            this.speedY = Math.random() * 6 + 4; // Fast falling
            this.speedX = Math.random() * 5 + 2; // Strong wind pushing right
            this.opacity = Math.random() * 0.6 + 0.2; // Higher visibility
            break;
          case WeatherType.LIGHT_SNOW: // Gentle Snow
            this.size = Math.random() * 2.5 + 1;
            this.speedY = Math.random() * 1.5 + 0.5; // Slow drift
            this.speedX = Math.random() * 1 - 0.5; // Meandering
            break;
          case WeatherType.RAIN:
            this.size = Math.random() * 1 + 0.5;
            this.speedY = Math.random() * 10 + 15;
            this.speedX = -1;
            break;
          case WeatherType.STORM:
            this.size = Math.random() * 1 + 0.5;
            this.speedY = Math.random() * 18 + 22;
            this.speedX = -2;
            break;
          case WeatherType.WIND:
            this.size = Math.random() * 2 + 0.5;
            this.speedY = Math.random() * 0.2 + 0.1;
            this.speedX = Math.random() * 8 + 6;
            break;
          case WeatherType.CLEAR:
            this.size = Math.random() * 1.2 + 0.4;
            this.speedY = -Math.random() * 0.1 - 0.02; // Very slow drift
            this.speedX = (Math.random() - 0.5) * 0.1;
            this.opacity = Math.random() * 0.1 + 0.05;
            break;
          default:
            this.size = 0;
            this.speedY = 0;
            this.speedX = 0;
        }
      }

      update(cardRect: DOMRect | null) {
        this.y += this.speedY;
        this.x += this.speedX;

        const isSnowing = type === WeatherType.SNOW || type === WeatherType.LIGHT_SNOW;

        if (cardRect && (isSnowing || type === WeatherType.RAIN || type === WeatherType.STORM)) {
          // Adjust collision width for rounded corners (approx 2.5rem ~ 40px)
          // We restrict landing to the flat top surface
          const cornerInset = 42; 

          if (
            this.x > cardRect.left + cornerInset &&
            this.x < cardRect.right - cornerInset &&
            this.y > cardRect.top &&
            this.y < cardRect.top + this.speedY // Collision depth
          ) {
            if (isSnowing) {
                // Accumulate snow on card
                landedParticles.push({
                    x: this.x,
                    y: cardRect.top + Math.random() * 3,
                    size: this.size,
                    opacity: this.opacity,
                    life: 150 + Math.random() * 250
                });
                this.reset();
            } else if (type === WeatherType.RAIN || type === WeatherType.STORM) {
                for(let i = 0; i < 3; i++) {
                  splashes.push({
                    x: this.x,
                    y: cardRect.top,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -Math.random() * 3,
                    life: 15 + Math.random() * 10,
                    opacity: this.opacity
                  });
                }
                this.reset();
            }
          }
        }

        if (type === WeatherType.CLEAR) {
           if (this.y < -10) this.y = canvas!.height + 10;
        } else {
           if (this.y > canvas!.height) this.reset();
        }
        
        if (this.x > canvas!.width + 50 || this.x < -50) {
          // Wrap around for wind effects
          this.x = this.speedX > 0 ? -40 : canvas!.width + 40;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        if (type === WeatherType.SNOW || type === WeatherType.LIGHT_SNOW) {
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.fill();
        } else if (type === WeatherType.RAIN || type === WeatherType.STORM) {
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.speedX * 0.5, this.y + this.speedY * 0.5);
          ctx.strokeStyle = type === WeatherType.STORM ? `rgba(210, 210, 255, ${this.opacity})` : `rgba(180, 200, 240, ${this.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (type === WeatherType.WIND) {
          ctx.ellipse(this.x, this.y, this.size * 5, this.size * 0.5, Math.PI / 12, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 255, 255, ${this.opacity * 0.15})`;
          ctx.fill();
        } else if (type === WeatherType.CLEAR) {
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.fill();
        }
      }
    }

    const drawRealisticSunshine = (time: number) => {
      if (!ctx) return;
      const sourceX = canvas.width * 0.95;
      const sourceY = -canvas.height * 0.1;
      
      const breathe = Math.sin(time * 0.0005) * 0.05;
      const glare = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, canvas.width * 0.9);
      glare.addColorStop(0, `rgba(255, 255, 230, ${0.4 + breathe})`);
      glare.addColorStop(0.2, `rgba(255, 250, 200, ${0.15 + breathe})`);
      glare.addColorStop(0.5, 'rgba(255, 245, 180, 0.05)');
      glare.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glare;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(sourceX, sourceY);
      
      raysRef.current.forEach((ray) => {
        const slowSway = Math.sin(time * ray.speed + ray.offset) * 0.05;
        const slowPulse = (Math.sin(time * ray.speed * 2 + ray.offset) + 1) / 2;
        
        ctx.save();
        ctx.rotate(ray.angle + slowSway);
        
        const rayLen = canvas.width * ray.length;
        const rayGrad = ctx.createLinearGradient(0, 0, rayLen, 0);
        const currentOpacity = ray.opacity * (0.8 + slowPulse * 0.4);
        
        rayGrad.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
        rayGrad.addColorStop(0.3, `rgba(255, 255, 255, ${currentOpacity * 0.3})`);
        rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(0, -ray.width / 2);
        ctx.lineTo(rayLen, -ray.width);
        ctx.lineTo(rayLen, ray.width);
        ctx.lineTo(0, ray.width / 2);
        ctx.fill();
        ctx.restore();
      });
      
      ctx.restore();

      const flareX = canvas.width * 0.3;
      const flareY = canvas.height * 0.7;
      const flareGrad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, 200);
      flareGrad.addColorStop(0, 'rgba(255, 230, 255, 0.03)');
      flareGrad.addColorStop(0.5, 'rgba(230, 240, 255, 0.02)');
      flareGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(flareX, flareY, 200, 0, Math.PI * 2);
      ctx.fill();
    };

    particles = Array.from({ length: particleCount }, () => {
        const p = new Particle();
        p.y = Math.random() * canvas.height;
        return p;
    });

    let flashTimer = 0;
    const animate = (currentTime: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cardRect = cardRef.current?.getBoundingClientRect() || null;
      const elapsed = currentTime - startTime;

      if (type === WeatherType.CLEAR) {
        drawRealisticSunshine(elapsed);
      }

      if (type === WeatherType.STORM) {
        flashTimer++;
        if (flashTimer % 240 === 0 && Math.random() > 0.85) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      for (let i = landedParticles.length - 1; i >= 0; i--) {
          const lp = landedParticles[i];
          
          // Gravity: Snow slides down slowly
          lp.y += 0.25;

          ctx.beginPath();
          ctx.arc(lp.x, lp.y, lp.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${lp.opacity * (lp.life / 50)})`;
          ctx.fill();
          lp.life--;
          if (lp.life <= 0) landedParticles.splice(i, 1);
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${s.opacity * (s.life / 20)})`;
        ctx.fill();
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.2;
        s.life--;
        if (s.life <= 0) splashes.splice(i, 1);
      }

      particles.forEach(p => {
        p.update(cardRect);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [type, cardRef]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />;
};

export default WeatherOverlay;
