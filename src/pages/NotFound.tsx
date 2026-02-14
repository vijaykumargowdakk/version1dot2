'use client';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

// Stick Figure SVG URLs
const STICK_FIGURES = [
  { top: '0%', src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg', transform: 'rotateZ(-90deg)', speedX: 1500 },
  { top: '10%', src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick1.svg', speedX: 3000, speedRotation: 2000 },
  { top: '20%', src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick2.svg', speedX: 5000, speedRotation: 1000 },
  { top: '25%', src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg', speedX: 2500, speedRotation: 1500 },
  { top: '35%', src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg', speedX: 2000, speedRotation: 300 },
  { bottom: '5%', src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick3.svg', speedX: 0 },
];

type StickFigure = {
  top?: string;
  bottom?: string;
  src: string;
  transform?: string;
  speedX: number;
  speedRotation?: number;
};

function MessageDisplay() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center z-30 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="text-center px-4">
        <p className="text-lg md:text-xl text-muted-foreground mb-2 uppercase tracking-widest">
          Page Not Found
        </p>
        <h1 className="text-[120px] md:text-[180px] lg:text-[220px] font-black text-foreground leading-none select-none">
          404
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mt-4 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="text-foreground border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-300 ease-in-out px-6 py-2 text-base font-medium flex items-center justify-center gap-2 hover:scale-105 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 ease-in-out px-6 py-2 text-base font-medium flex items-center justify-center gap-2 hover:scale-105 rounded-lg"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

function CharactersAnimation() {
  const charactersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!charactersRef.current) return;
    charactersRef.current.innerHTML = '';

    STICK_FIGURES.forEach((figure, index) => {
      const stick = document.createElement('img');
      stick.classList.add('characters');
      stick.style.position = 'absolute';
      stick.style.width = '18%';
      stick.style.height = '18%';
      stick.style.filter = 'var(--stick-filter, none)';
      if (figure.top) stick.style.top = figure.top;
      if (figure.bottom) stick.style.bottom = figure.bottom;
      stick.src = figure.src;
      if (figure.transform) stick.style.transform = figure.transform;
      charactersRef.current?.appendChild(stick);

      if (index === 5) return; // Last figure stays static
      stick.animate([{ left: '100%' }, { left: '-20%' }], { 
        duration: figure.speedX, 
        easing: 'linear', 
        fill: 'forwards' 
      });
      if (index === 0) return; // First figure doesn't rotate
      if (figure.speedRotation) {
        stick.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }], { 
          duration: figure.speedRotation, 
          iterations: Infinity, 
          easing: 'linear' 
        });
      }
    });

    return () => {
      if (charactersRef.current) charactersRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={charactersRef} className="absolute inset-0 z-10 overflow-hidden pointer-events-none" />;
}

interface Circulo {
  x: number;
  y: number;
  size: number;
}

function CircleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>();
  const timerRef = useRef(0);
  const circulosRef = useRef<Circulo[]>([]);

  const initArr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    circulosRef.current = [];
    for (let index = 0; index < 300; index++) {
      const randomX = Math.floor(Math.random() * ((canvas.width * 3) - (canvas.width * 1.2) + 1)) + (canvas.width * 1.2);
      const randomY = Math.floor(Math.random() * (canvas.height - (canvas.height * -0.2) + 1)) + (canvas.height * -0.2);
      const size = canvas.width / 1000;
      circulosRef.current.push({ x: randomX, y: randomY, size });
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    timerRef.current++;
    context.setTransform(1, 0, 0, 1, 0, 0);
    const distanceX = canvas.width / 80;
    const growthRate = canvas.width / 1000;
    
    // Use CSS variable for dot color (adapts to theme)
    const computedStyle = getComputedStyle(document.documentElement);
    const dotColor = computedStyle.getPropertyValue('--foreground').trim() || '0 0% 100%';
    context.fillStyle = `hsl(${dotColor})`;
    context.clearRect(0, 0, canvas.width, canvas.height);

    circulosRef.current.forEach((circulo) => {
      context.beginPath();
      if (timerRef.current < 65) {
        circulo.x = circulo.x - distanceX;
        circulo.size = circulo.size + growthRate;
      }
      if (timerRef.current > 65 && timerRef.current < 500) {
        circulo.x = circulo.x - (distanceX * 0.02);
        circulo.size = circulo.size + (growthRate * 0.2);
      }
      context.arc(circulo.x, circulo.y, circulo.size, 0, 360);
      context.fill();
    });

    if (timerRef.current > 500) {
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
      return;
    }
    requestIdRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    timerRef.current = 0;
    initArr();
    draw();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      timerRef.current = 0;
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
      const context = canvas.getContext('2d');
      if (context) context.reset();
      initArr();
      draw();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}

export default function NotFound() {
  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <CircleAnimation />
      <CharactersAnimation />
      <MessageDisplay />
      
      {/* CSS for theme-aware stick figure colors */}
      <style>{`
        .dark {
          --stick-filter: invert(1);
        }
        :root {
          --stick-filter: none;
        }
      `}</style>
    </div>
  );
}
