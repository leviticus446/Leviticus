'use client';
import { useState } from 'react';

const links = [
  { href: '#menu', label: 'Menu' },
  { href: '#cerita', label: 'Cerita Kita' },
  { href: '#galeri', label: 'Galeri' },
  { href: '#kontak', label: 'Kontak' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-charcoal/70 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="/" className="font-display text-xl tracking-wide text-gold">
          LEVITICUS 11
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-ivory/80 text-sm tracking-wide hover:text-gold transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/reservasi"
            className="border border-gold text-gold px-5 py-2 text-xs tracking-widest2 uppercase hover:bg-gold hover:text-charcoal transition-colors"
          >
            Reservasi
          </a>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          aria-label="Buka menu"
          className="md:hidden text-ivory w-8 h-8 flex flex-col items-center justify-center gap-1.5"
        >
          <span className={`block h-px w-6 bg-gold transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-px w-6 bg-gold transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-px w-6 bg-gold transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-charcoal border-t border-gold/20 px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-ivory/80 text-sm tracking-wide"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/reservasi"
            className="border border-gold text-gold text-center px-5 py-2 text-xs tracking-widest2 uppercase"
          >
            Reservasi
          </a>
        </nav>
      )}
    </header>
  );
}
