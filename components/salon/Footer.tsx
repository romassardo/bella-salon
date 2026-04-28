export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-mega serif">
        Bella<em>.</em>
      </div>
      <div className="footer-grid">
        <div className="footer-col">
          <h4>Empezar</h4>
          <a href="#res" className="footer-cta">
            Reservar →
          </a>
          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              opacity: 0.65,
              maxWidth: 240,
              lineHeight: 1.5,
            }}
          >
            Tu lugar de belleza, con la calma que merecés y la rapidez que necesitás.
          </p>
        </div>
        <div className="footer-col">
          <h4>Salón</h4>
          <a href="#cat">Catálogo</a>
          <a href="#asis">Asistente Bella</a>
          <a href="#res">Reservar</a>
        </div>
        <div className="footer-col">
          <h4>Contacto</h4>
          <a href="tel:+543515698724">+54 351 569 8724</a>
          <a href="mailto:hola@salonbella.ar">hola@salonbella.ar</a>
          <a href="https://maps.google.com" target="_blank" rel="noreferrer">
            Santa Fe 2345, CABA
          </a>
        </div>
        <div className="footer-col">
          <h4>Horarios</h4>
          <span>Lun–Vie · 9–20 h</span>
          <span>Sáb · 9–18 h</span>
          <span>Dom · cerrado</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Salón Bella</span>
        <span>Buenos Aires · Argentina</span>
      </div>
    </footer>
  );
}
