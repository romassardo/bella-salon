const ITEMS = ['Corte', 'Coloración', 'Manicure', 'Pedicure', 'Maquillaje social', 'Tratamiento facial'];

function Star() {
  return (
    <span className="star">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L13.5 8.5L22 12L13.5 15.5L12 24L10.5 15.5L2 12L10.5 8.5Z" />
      </svg>
    </span>
  );
}

function Track() {
  return (
    <span className="marquee-item">
      {ITEMS.map((item, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 48 }}>
          {item} <Star />
        </span>
      ))}
    </span>
  );
}

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <Track />
        <Track />
      </div>
    </div>
  );
}
