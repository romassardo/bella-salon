'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Svc = { id: string; name: string; dur: string; precio: number; desc: string };

const SVCS: readonly Svc[] = [
  { id: 'corte', name: 'Corte', dur: '45 min', precio: 8000, desc: 'Personalizado, lavado y secado' },
  { id: 'color', name: 'Coloración', dur: '120 min', precio: 25000, desc: 'Color completo o reflejos' },
  { id: 'mani', name: 'Manicure', dur: '45 min', precio: 5000, desc: 'Clásica con esmaltado' },
  { id: 'pedi', name: 'Pedicure', dur: '60 min', precio: 7000, desc: 'Spa con hidratación' },
  { id: 'maq', name: 'Maquillaje social', dur: '60 min', precio: 12000, desc: 'Para evento social' },
  { id: 'fac', name: 'Tratamiento facial', dur: '75 min', precio: 15000, desc: 'Limpieza + hidratación' },
];


const DOWS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const;

type Day = { key: string; day: number; dow: string; dis: boolean; label: string };

function buildDays(): Day[] {
  const out: Day[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = DOWS[d.getDay()]!;
    out.push({
      key: d.toISOString().slice(0, 10),
      day: d.getDate(),
      dow,
      dis: d.getDay() === 0,
      label: `${dow} ${d.getDate()} ${MONTHS[d.getMonth()]}`,
    });
  }
  return out;
}

export function Booking() {
  const [step, setStep] = useState(0);
  const [svc, setSvc] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[] | null>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [timesError, setTimesError] = useState<string | null>(null);
  const days = useMemo(() => buildDays(), []);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svc || !day) {
      setAvailableTimes(null);
      setTimesError(null);
      return;
    }
    const sName = SVCS.find((s) => s.id === svc)?.name;
    if (!sName) return;
    const ctrl = new AbortController();
    setLoadingTimes(true);
    setTimesError(null);
    setTime(null);
    fetch(`/api/horarios?servicio=${encodeURIComponent(sName)}&fecha=${day}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((data: { slots?: string[]; closed?: string | null; error?: string }) => {
        if (data.error) {
          setTimesError(data.error);
          setAvailableTimes([]);
        } else if (data.closed) {
          setTimesError(data.closed);
          setAvailableTimes([]);
        } else {
          setAvailableTimes(data.slots ?? []);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setTimesError('No pudimos cargar los horarios. Probá de nuevo.');
        setAvailableTimes([]);
      })
      .finally(() => setLoadingTimes(false));
    return () => ctrl.abort();
  }, [svc, day]);

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

  const sSvc = SVCS.find((s) => s.id === svc);
  const sDay = days.find((d) => d.key === day);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const stepOk = [
    !!svc,
    !!day && !!time,
    name.trim().length > 1 && phone.trim().length > 4 && emailOk,
    true,
  ];
  const canNext = stepOk[step];

  const reset = () => {
    setStep(0);
    setSvc(null);
    setDay(null);
    setTime(null);
    setName('');
    setPhone('');
    setEmail('');
    setSubmitError(null);
  };

  const submit = async () => {
    if (!sSvc || !day || !time) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fechaHora = `${day}T${time}:00-03:00`;
      const res = await fetch('/api/reservar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: name,
          telefono: phone,
          email,
          servicio_nombre: sSvc.name,
          fecha_hora: fechaHora,
          medio_reserva: 'formulario',
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSubmitError(
          body.error?.toLowerCase().includes('superpuesto') || res.status === 409
            ? 'Ese horario justo se ocupó. Elegí otro horario, por favor.'
            : 'No pudimos confirmar tu reserva. Probá de nuevo en un toque.',
        );
        return;
      }
      setStep(3);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reservar" id="res">
      <div className="res-grid">
        <div className="res-info reveal" ref={infoRef}>
          <div className="asis-tag" style={{ background: 'var(--hot)' }}>
            <span className="live" style={{ background: 'var(--paper)' }} /> Reserva express
          </div>
          <h2 className="serif">
            Cuatro pasos.
            <br />
            <em>Sin esperas.</em>
          </h2>
          <p>
            Elegí servicio, día y hora. Te respondemos al instante con la confirmación y un
            recordatorio antes del turno.
          </p>
          <div className="res-stats">
            <div className="res-stat">
              <div className="num">04</div>
              <div className="lbl">Pasos</div>
            </div>
            <div className="res-stat">
              <div className="num">~12s</div>
              <div className="lbl">Tiempo total</div>
            </div>
            <div className="res-stat">
              <div className="num">0</div>
              <div className="lbl">DMs</div>
            </div>
          </div>
        </div>

        <div className="res-card">
          <div className="progress">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={step === i ? 'act' : step > i ? 'don' : ''} />
            ))}
          </div>
          <div className="step-tag">{`Paso 0${step + 1} / 04`}</div>

          {step === 0 && (
            <>
              <div className="step-h">
                ¿Qué <em>buscás</em>?
              </div>
              <div className="svc-grid">
                {SVCS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`svc-pick ${svc === s.id ? 'sel' : ''}`}
                    onClick={() => setSvc(s.id)}
                  >
                    <strong>{s.name}</strong>
                    <span>{s.dur}</span>
                    <div className="row">
                      <span>{s.desc}</span>
                      <span>${s.precio.toLocaleString('es-AR')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="step-h">
                Elegí <em>día y hora</em>
              </div>
              <div className="cal">
                {days.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={`cal-d ${day === d.key ? 'sel' : ''} ${d.dis ? 'dis' : ''}`}
                    disabled={d.dis}
                    onClick={() => !d.dis && setDay(d.key)}
                  >
                    <span className="dow">{d.dow}</span>
                    <span style={{ fontWeight: 600 }}>{d.day}</span>
                  </button>
                ))}
              </div>
              {day && (
                <>
                  {loadingTimes && (
                    <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
                      Buscando horarios disponibles…
                    </div>
                  )}
                  {!loadingTimes && timesError && (
                    <div style={{ marginTop: 16, fontSize: 13, color: 'var(--hot)' }}>
                      {timesError}
                    </div>
                  )}
                  {!loadingTimes && availableTimes && availableTimes.length === 0 && !timesError && (
                    <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
                      No quedan horarios disponibles para ese día. Probá con otro.
                    </div>
                  )}
                  {!loadingTimes && availableTimes && availableTimes.length > 0 && (
                    <div className="times">
                      {availableTimes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`time-pick ${time === t ? 'sel' : ''}`}
                          onClick={() => setTime(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="step-h">
                Tus <em>datos</em>
              </div>
              <div className="field">
                <label htmlFor="bk-name">Nombre completo</label>
                <input
                  id="bk-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Martina López"
                />
              </div>
              <div className="field">
                <label htmlFor="bk-phone">Teléfono</label>
                <input
                  id="bk-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="3515698724"
                  inputMode="tel"
                />
              </div>
              <div className="field">
                <label htmlFor="bk-email">Email</label>
                <input
                  id="bk-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="martina@gmail.com"
                  inputMode="email"
                  type="email"
                  aria-invalid={email.trim().length > 0 && !emailOk}
                  style={
                    email.trim().length > 0 && !emailOk
                      ? { borderColor: 'var(--hot)', outlineColor: 'var(--hot)' }
                      : undefined
                  }
                />
                {email.trim().length > 0 && !emailOk && (
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--hot)' }}>
                    Mail inválido. Revisá que tenga el formato nombre@dominio.com.
                  </div>
                )}
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  background: 'rgba(242,237,230,0.05)',
                  borderRadius: 12,
                  fontSize: 12,
                  opacity: 0.7,
                  lineHeight: 1.5,
                }}
              >
                Te enviamos un recordatorio por mail 24 h antes del turno.
              </div>
              {submitError && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--hot)' }}>
                  {submitError}
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="confirm-anim">
                <div className="ring">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0E0B0A"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3>Tu turno está reservado.</h3>
                <p>Te enviamos la confirmación por mail en breve.</p>
              </div>
              <div className="summary">
                <div className="sum-row">
                  <span className="k">Servicio</span>
                  <span>{sSvc?.name}</span>
                </div>
                <div className="sum-row">
                  <span className="k">Día</span>
                  <span>{sDay?.label}</span>
                </div>
                <div className="sum-row">
                  <span className="k">Hora</span>
                  <span>{time}</span>
                </div>
                <div className="sum-row">
                  <span className="k">Cliente</span>
                  <span>{name}</span>
                </div>
                <div className="sum-row">
                  <span className="k">Total</span>
                  <span>${sSvc?.precio.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </>
          )}

          {step < 3 ? (
            <div className="step-nav">
              {step > 0 && (
                <button
                  type="button"
                  className="back"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Atrás
                </button>
              )}
              <button
                type="button"
                className="next"
                onClick={() => {
                  if (step === 2) void submit();
                  else setStep((s) => s + 1);
                }}
                disabled={!canNext || submitting}
              >
                {submitting ? 'Enviando…' : step === 2 ? 'Confirmar' : 'Continuar'}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="step-nav">
              <button type="button" className="next" onClick={reset}>
                Hacer otra reserva
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
