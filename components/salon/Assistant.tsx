'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BELLA_QUICK_PROMPTS } from '@/lib/ai/prompt';

type Role = 'user' | 'bot';
type Msg = { role: Role; text: string };

function newSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function Assistant() {
  const sessionId = useMemo(() => newSessionId(), []);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: '¡Hola! Soy Bella ✨ ¿En qué te ayudo hoy?' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    });
  }, [messages, typing, showConfirm]);

  useEffect(() => {
    if (typing || messages.length <= 1) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [typing, messages.length]);

  useEffect(() => {
    const el = infoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('in');
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const next: Msg[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(next);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, message: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        text?: string;
        booked?: boolean;
        error?: string;
      };
      setTyping(false);

      const reply =
        data.text?.trim() ||
        (data.error
          ? 'Uy, tuvimos un problema. Probá de nuevo en un toque.'
          : 'Decime un poco más para ayudarte mejor.');
      setMessages((m) => [...m, { role: 'bot', text: reply }]);

      if (data.booked === true) {
        setTimeout(() => setShowConfirm(true), 600);
      }
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { role: 'bot', text: 'Uy, se me cortó la conexión. Probá de nuevo en un toque.' },
      ]);
    }
  };

  return (
    <section className="asistente" id="asis">
      <div className="asis-grid">
        <div className="asis-info reveal" ref={infoRef}>
          <div className="asis-tag">
            <span className="live" /> Bella · en línea
          </div>
          <h2 className="serif">
            Conocé a <em>Bella.</em>
            <br />
            Tu asistente.
          </h2>
          <p>
            Hablá normal — como con una amiga. <em>Bella</em> entiende lo que necesitás, consulta
            la agenda real del salón y te confirma en segundos.
          </p>
          <div className="asis-feats">
            <div className="asis-feat">
              <div className="dot">•</div>
              <div>
                <strong>24/7 disponible</strong>
                <span>Reservá a cualquier hora.</span>
              </div>
            </div>
            <div className="asis-feat">
              <div className="dot">•</div>
              <div>
                <strong>Disponibilidad real</strong>
                <span>Consulta la agenda en vivo.</span>
              </div>
            </div>
            <div className="asis-feat">
              <div className="dot">•</div>
              <div>
                <strong>Recordatorios automáticos</strong>
                <span>24 h antes del turno.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="phone-shell">
          <div className="phone-screen">
            <div className="phone-notch">
              <span>09:41</span>
              <div className="dots">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="chat-head">
              <div className="chat-avatar">B</div>
              <div className="chat-head-info">
                <strong>Bella</strong>
                <div className="sub">tu asistente · en línea</div>
              </div>
            </div>
            <div className="chat-body" ref={bodyRef}>
              {messages.map((m, i) => (
                <div key={i} className={`bubble ${m.role}`}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="bubble bot" style={{ padding: '12px 14px' }}>
                  <div className="typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              {showConfirm && (
                <div className="bubble confirm">
                  <div className="check">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Reserva confirmada
                  </div>
                  <div className="row">
                    <span>Cliente</span>
                    <span>Vos ✨</span>
                  </div>
                  <div className="row">
                    <span>Lugar</span>
                    <span>Salón Bella · CABA</span>
                  </div>
                  <div className="row">
                    <span>Recordatorio</span>
                    <span>Mail 24 h antes</span>
                  </div>
                </div>
              )}
              {messages.length <= 1 && !typing && (
                <div className="quick-prompts">
                  {BELLA_QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="quick-prompt"
                      onClick={() => void send(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <form
              className="chat-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <input
                ref={inputRef}
                placeholder="Escribile a Bella..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={typing}
                aria-label="Mensaje para Bella"
              />
              <button
                type="submit"
                aria-label="Enviar"
                disabled={!input.trim() || typing}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
