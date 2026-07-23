'use client';
import { useEffect, useRef, Children } from 'react';

// Efek "coverflow": kartu tengah tegak & tajam, kartu samping miring & pudar.
// PENTING: komponen ini nerima `children` (React element jadi), BUKAN function
// renderItem — karena function gak boleh dikirim dari Server Component ke Client Component.
export default function Carousel3D({ children }) {
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const items = Children.toArray(children);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function updateTilt() {
      const trackRect = track.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;

      cardRefs.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = (cardCenter - centerX) / (trackRect.width / 2);
        const clamped = Math.max(-1, Math.min(1, distance));
        const rotateY = clamped * -22;
        const scale = 1 - Math.abs(clamped) * 0.14;
        const opacity = 1 - Math.abs(clamped) * 0.4;
        card.style.transform = `perspective(1200px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = String(Math.max(0.5, opacity));
      });
    }

    updateTilt();
    track.addEventListener('scroll', updateTilt, { passive: true });
    window.addEventListener('resize', updateTilt);
    return () => {
      track.removeEventListener('scroll', updateTilt);
      window.removeEventListener('resize', updateTilt);
    };
  }, [items.length]);

  return (
    <div
      ref={trackRef}
      className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 px-[12%] md:px-[20%]"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {items.map((child, i) => (
        <div
          key={i}
          ref={(el) => (cardRefs.current[i] = el)}
          className="snap-center shrink-0 w-[72%] sm:w-[50%] md:w-[32%] transition-transform duration-150 will-change-transform"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
