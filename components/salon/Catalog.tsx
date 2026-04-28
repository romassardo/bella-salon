'use client';

import { useState } from 'react';

type Svc = {
  num: string;
  name: string;
  tag: string;
  dur: string;
  precio: string;
  desc: string;
  img: string;
};

const SVCS: readonly Svc[] = [
  {
    num: '01',
    name: 'Manicure',
    tag: 'Hands',
    dur: '45 min',
    precio: '$5.000',
    desc: 'Manicure clásica con esmaltado de larga duración. Lima, cutícula, hidratación y color a elección.',
    img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&q=80&auto=format&fit=crop',
  },
  {
    num: '02',
    name: 'Corte',
    tag: 'Hair',
    dur: '45 min',
    precio: '$8.000',
    desc: 'Corte personalizado con asesoría de imagen. Incluye lavado, tratamiento y secado profesional.',
    img: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=900&q=80&auto=format&fit=crop',
  },
  {
    num: '03',
    name: 'Coloración',
    tag: 'Color',
    dur: '120 min',
    precio: '$25.000',
    desc: 'Color completo o reflejos profesionales. Tinte premium, tratamiento de protección y peinado final.',
    img: 'https://images.unsplash.com/photo-1712213396688-c6f2d536671f?w=900&q=80&auto=format&fit=crop',
  },
  {
    num: '04',
    name: 'Pedicure',
    tag: 'Feet',
    dur: '60 min',
    precio: '$7.000',
    desc: 'Pedicure spa con hidratación profunda. Exfoliación, masaje y esmaltado.',
    img: 'https://images.unsplash.com/photo-1664643411326-6c589531be3c?w=900&q=80&auto=format&fit=crop',
  },
  {
    num: '05',
    name: 'Maquillaje social',
    tag: 'Makeup',
    dur: '60 min',
    precio: '$12.000',
    desc: 'Maquillaje para evento social o sesión de fotos. Productos premium, larga duración.',
    img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=80&auto=format&fit=crop',
  },
  {
    num: '06',
    name: 'Tratamiento facial',
    tag: 'Skin',
    dur: '75 min',
    precio: '$15.000',
    desc: 'Limpieza profunda + hidratación. Vapor, extracción suave, mascarilla y serum.',
    img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80&auto=format&fit=crop',
  },
];

export function Catalog() {
  const [idx, setIdx] = useState(0);
  const s = SVCS[idx]!;

  return (
    <section className="catalogo" id="cat">
      <div className="cat-head">
        <h2 className="serif">
          El <em>catálogo</em>.<br />
          Seis rituales.
        </h2>
        <div className="sub">
          Tap en cualquiera para ver detalle. Cada servicio incluye consulta, ejecución y producto.
        </div>
      </div>

      <div className="cat-tabs">
        {SVCS.map((svc, i) => (
          <button
            key={svc.num}
            type="button"
            className={`cat-tab ${i === idx ? 'active' : ''}`}
            onClick={() => setIdx(i)}
          >
            <span className="num">{svc.num}</span> {svc.name}
          </button>
        ))}
      </div>

      <div className="cat-stage">
        <div className="cat-card">
          {SVCS.map((svc, i) => (
            <div
              key={svc.num}
              className={`cat-card-img ${i === idx ? 'active' : ''}`}
              style={{ backgroundImage: `url('${svc.img}')` }}
            />
          ))}
          <div className="cat-card-overlay" />
          <div className="cat-card-tag">
            {s.num} / {s.name}
          </div>
          <div className="cat-card-corner" aria-hidden>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </div>
        </div>

        <div className="cat-info" key={s.num}>
          <div className="cat-content">
            <div className="cat-info-num serif">{s.num}</div>
            <div className="cat-info-name serif">
              {s.name}
              <em>.</em>
            </div>
            <p className="cat-info-desc">{s.desc}</p>
          </div>
          <div>
            <div className="cat-info-row">
              <span className="k">Duración</span>
              <span className="v">{s.dur}</span>
            </div>
            <div className="cat-info-row">
              <span className="k">Desde</span>
              <span className="v">{s.precio}</span>
            </div>
            <div className="cat-info-row">
              <span className="k">Categoría</span>
              <span className="v">{s.tag}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
