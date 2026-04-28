'use client';

import { useEffect, useRef } from 'react';

export function About() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLSpanElement>('.word');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            words.forEach((w, i) => setTimeout(() => w.classList.add('lit'), i * 60));
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="about" id="about">
      <div className="about-text" ref={ref}>
        <div className="line">
          <span className="word">Reservás</span> <span className="word">cuando</span>{' '}
          <span className="word">querés.</span> <span className="word hi">Te</span>{' '}
          <span className="word hi">respondemos</span>
        </div>
        <div className="line">
          <span className="word hi">al</span> <span className="word hi">instante.</span>
          <span className="accent-pill" />
          <span className="word">Sin</span> <span className="word">DMs,</span>{' '}
          <span className="word">sin</span> <span className="word">esperas,</span>
        </div>
        <div className="line">
          <span className="word">sin</span> <span className="word">agendas</span>{' '}
          <span className="word">de</span> <span className="word">papel.</span>
        </div>
      </div>
    </section>
  );
}
