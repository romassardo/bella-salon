'use client';

import { useEffect, useState } from 'react';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState('BA · --:--');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setTime(`BA · ${h}:${m}`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#" className="logo">
        Salón <em>Bella</em>
        <span className="badge">&apos;26</span>
      </a>
      <div className="nav-mid">
        <a href="#about">Sobre</a>
        <a href="#cat">Catálogo</a>
        <a href="#asis">Asistente</a>
        <a href="#res">Reservar</a>
      </div>
      <span className="nav-time">{time}</span>
    </nav>
  );
}
