export function Hero() {
  return (
    <section className="hero">
      <div className="chrome-bg">
        <div className="chrome-blob b1" />
        <div className="chrome-blob b2" />
        <div className="chrome-blob b3" />
      </div>

      <div className="hero-top">
        <div className="col">
          <div className="label">[01] El salón</div>
          Buenos Aires, AR
          <br />
          Av. Santa Fe 2345
        </div>
        <div className="col">
          <div className="label">[02] Estado</div>
          Reservas abiertas — turnos esta semana
        </div>
        <div className="col">
          <div className="label">[03] Año</div>
          Edición 2026 · v2.0
        </div>
      </div>

      <h1 className="hero-title serif">
        <div className="row">
          <span className="word-1">Belleza</span>
          <span
            className="tag-img"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&q=80&auto=format&fit=crop')",
            }}
          />
          <span className="word-2 italic">sin</span>
        </div>
        <div className="row">
          <span className="word-3">esperas,</span>
          <span className="tag-bubble">
            <span className="star" /> reservá en 12 s
          </span>
        </div>
        <div className="row">
          <span className="word-4 italic">sin</span>
          <span className="tag-emoji">∞</span>
          <span className="word-5">vueltas.</span>
        </div>
      </h1>

      <div className="hero-bottom">
        <p className="hero-lead">
          Corte, color, manicure, maquillaje. Un salón que <em>responde</em> al instante — por web
          o por <em>Bella</em>, tu asistente virtual.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="num serif">
              4.9<span style={{ fontSize: '0.5em', opacity: 0.5 }}>/5</span>
            </div>
            <div className="lbl">+2.4k reseñas</div>
          </div>
          <div className="hero-stat">
            <div className="num serif">
              12<span style={{ fontSize: '0.5em', opacity: 0.5 }}>s</span>
            </div>
            <div className="lbl">Confirmación</div>
          </div>
        </div>
        <div className="hero-cta-pair">
          <a href="#res" className="btn-big">
            <span>Reservar turno</span>
            <span className="arrow">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </span>
          </a>
          <a href="#asis" className="btn-ghost-big">
            Hablar con Bella →
          </a>
        </div>
      </div>
    </section>
  );
}
