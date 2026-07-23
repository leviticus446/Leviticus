'use client';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1700);
    const removeTimer = setTimeout(() => setVisible(false), 2300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-charcoal flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Aksen sudut — biar gak polos kotak */}
      <span className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-gold" />
      <span className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-gold" />
      <span className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-gold" />
      <span className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-gold" />

      <div className="text-center px-6">
        <h1 className="font-display text-4xl md:text-5xl gold-shimmer-text tracking-anim">
          LEVITICUS 11
        </h1>
        <p className="mt-3 text-[10px] md:text-xs tracking-widest2 uppercase text-ivory/50">
          We Serve You Clean Food
        </p>
      </div>
    </div>
  );
}
