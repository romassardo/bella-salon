# Spec: Salón Bella — Sistema de Reservas Inteligente

**Fecha:** 2026-04-26
**Proyecto:** Módulo 3 — Proyecto Integrador
**Stack final:** Next.js 15 (App Router) + Supabase + n8n + OpenAI GPT-4o (vía n8n) + Telegram + Vercel

---

## 1. Objetivo

Construir un MVP web para **Salón Bella** que permita recibir, gestionar y confirmar reservas de manera automática mediante:

- Formulario web moderno con animaciones
- Asistente IA conversacional (OpenAI GPT-4o ejecutado dentro de n8n; tool-use opcional en F4+)
- Workflows en n8n para registro, notificaciones y recordatorios
- Notificaciones por **Telegram** (al dueño y como recordatorio al cliente)
- Email fallback vía Gmail (nodo n8n) para confirmaciones

## 2. Cambios respecto a la consigna original

| Original | Reemplazo | Razón |
|----------|-----------|-------|
| Lovable | **Next.js 15 + Claude Code** | Mayor control, UI moderna animada, deploy en Vercel |
| WhatsApp | **Telegram Bot API** | Gratis, sin verificación de Meta, integración directa con n8n |

## 3. Arquitectura

```
┌─────────────────────────────┐
│  Next.js 15 App (Vercel)    │
│  ├─ Landing animada         │
│  ├─ /reservar (form)        │
│  ├─ /asistente (chat IA)    │
│  ├─ /admin (dashboard)      │
│  └─ /api/chat (proxy n8n)   │
└──────────────┬──────────────┘
               │ POST webhook
               ▼
┌─────────────────────────────┐
│  n8n (instancia del usuario)│
│  ├─ wf-recepcion-reserva    │
│  ├─ wf-asistente-helper     │
│  └─ wf-recordatorios-cron   │
└──────┬───────┬──────┬───────┘
       │       │      │
       ▼       ▼      ▼
   Supabase  Telegram Email(Gmail (n8n))
   (DB+RLS)   Bot
```

## 4. Modelo de datos (Supabase)

```sql
-- clientes
id uuid pk default gen_random_uuid()
nombre_completo text not null
telefono text
email text
telegram_chat_id bigint nullable  -- para recordatorios opt-in
created_at timestamptz default now()

-- servicios
id uuid pk default gen_random_uuid()
nombre text not null
descripcion text
duracion_minutos int not null
precio numeric(10,2) not null
imagen_url text
activo boolean default true
created_at timestamptz default now()

-- citas
id uuid pk default gen_random_uuid()
cliente_id uuid references clientes(id)
servicio_id uuid references servicios(id)
fecha_hora timestamptz not null
estado text check (estado in ('confirmada','cancelada','completada')) default 'confirmada'
medio_reserva text check (medio_reserva in ('formulario','asistente_ia')) not null
notas text
profesional text
created_at timestamptz default now()

-- índice anti-doble-booking
unique(servicio_id, fecha_hora) where estado != 'cancelada'
```

**RLS:**
- `servicios`: lectura pública de activos
- `citas`, `clientes`: solo service_role (n8n) puede insertar; admin lee todo vía Supabase Auth

## 5. UI / UX

### Design System (de ui-ux-pro-max + override)

- **Pattern:** Hero-Centric + Social Proof
- **Estilo:** Soft UI Evolution (sombras suaves, profundidad sutil, WCAG AA+)
- **Tipografía:** Playfair Display (display) + Inter (body)
- **Paleta override (beauty/spa rosé):**
  - Primary: `#C9A6A0` (rosé)
  - Secondary: `#B8A4C9` (lavender)
  - Accent CTA: `#E89B8E` (coral)
  - Background: `#FBF7F4` (warm off-white)
  - Surface: `#FFFFFF`
  - Text: `#2A1F1B` (deep charcoal)
  - Muted: `#8B7B75`
- **Animación:** Framer Motion (microinteracciones), GSAP ScrollTrigger (parallax sutil), Lenis (smooth scroll). Duraciones 150–300ms. Respeta `prefers-reduced-motion`.
- **Iconografía:** Lucide (sin emojis estructurales).

### Páginas

1. **Landing `/`** — Hero con título display, subtítulo, CTA dual (reservar / hablar con asistente). Sección servicios (cards animadas con `layoutId`). Testimonios (carousel). Footer con info y mapa.
2. **`/reservar`** — Stepper animado de 3 pasos: Servicio → Fecha/Hora → Datos. Confirmación con check animado y resumen.
3. **`/asistente`** — Chat tipo Claude.ai. Streaming token-by-token. Burbujas con `layoutId` para entrada suave. Sugerencias rápidas como chips. Indicador "escribiendo".
4. **`/admin`** — Login con Supabase Auth. Dashboard con tabs: Hoy / Próximas / Historial. Cards glass con info. Acciones: cancelar, marcar completada.

### Microinteracciones clave

- Magnetic buttons en CTAs principales
- Scroll-reveal con stagger (30–50ms)
- Page transitions con shared element (logo/imagen del servicio)
- Confirmación final con confetti suave + checkmark animado
- Loading skeletons en chat y dashboard

## 6. Asistente IA

### Modelo
`gpt-4o` (OpenAI), llamado por el nodo OpenAI Chat dentro del workflow `wf-bella-chat` de n8n. `temperature 0.7`, `max_tokens 256`. Next.js sólo proxea al webhook firmado con HMAC.

### Tools expuestas al modelo
- `list_servicios()` → query Supabase
- `check_disponibilidad(servicio_id, fecha_hora)` → query
- `crear_reserva(cliente_data, servicio_id, fecha_hora, notas)` → POST a webhook n8n
- `parse_fecha(texto)` → utilidad para "viernes después de las 17"

### Prompt system (skeleton)
- Rol: asistente de Salón Bella
- Estilo: cálido, breve, en español rioplatense
- Reglas: nunca inventar servicios; si falta dato, preguntarlo; confirmar antes de crear; tras crear, enviar resumen formal con emojis controlados.

### Caching
Prompt caching habilitado en el system prompt y catálogo de servicios para reducir costos.

## 7. Workflows n8n

### `wf-recepcion-reserva`
- **Trigger:** Webhook POST `/reserva`
- Validación payload (Zod-equivalente con node Set+IF)
- Upsert cliente por teléfono o email
- Insert cita
- Envío Telegram al chat_id del dueño con resumen
- Email confirmación al cliente (Gmail (n8n))
- Manejo de errores: try/catch node + log a tabla `errors_log`

### `wf-asistente-helper`
- **Trigger:** Webhook (llamado desde tools del SDK)
- Endpoints internos: list_servicios, check_disponibilidad, crear_reserva
- Respuesta JSON estructurada

### `wf-recordatorios-cron`
- **Trigger:** Cron diario 09:00 ART
- Query: citas confirmadas con fecha_hora entre `now()+24h` y `now()+25h`
- Para cada cita: si cliente tiene `telegram_chat_id` → mensaje Telegram; sino → email
- Marca `recordatorio_enviado = true` (campo a agregar)

## 8. Estructura del repo

```
Modulo3/
├── .claude/
│   ├── agents/           # 11 agentes especializados
│   ├── skills/           # skills locales del proyecto
│   └── settings.json
├── design-system/
│   ├── MASTER.md         # source of truth visual
│   └── pages/            # overrides por página
├── app/                  # Next.js App Router
│   ├── (marketing)/page.tsx
│   ├── reservar/
│   ├── asistente/
│   ├── admin/
│   └── api/
│       ├── chat/route.ts
│       └── reservar/route.ts
├── components/
│   ├── ui/               # shadcn primitives
│   ├── animated/         # framer-motion wrappers
│   └── salon/            # dominio
├── lib/
│   ├── supabase/         # clients
│   ├── ai/               # prompt + tools
│   ├── telegram/
│   └── validation/       # Zod schemas
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── n8n/
│   └── workflows/        # JSON exports
├── docs/
│   ├── superpowers/specs/
│   ├── arquitectura.md
│   ├── prompt-ia.md
│   ├── deploy.md
│   └── video-demo-guion.md
└── tests/
    ├── unit/
    └── e2e/
```

## 9. Roadmap por fases

| Fase | Entregable |
|------|-----------|
| F0 | Scaffold Next.js + Tailwind v4 + shadcn + lint + tests + `.claude/` |
| F1 | Migrations Supabase + seed de servicios + types generados |
| F2 | Landing animada + `/reservar` con stepper |
| F3 | n8n `wf-recepcion-reserva` + Telegram bot dueño |
| F4 | Workflow `wf-bella-chat` en n8n (OpenAI GPT-4o) + chat conectado |
| F5 | `wf-recordatorios-cron` |
| F6 | `/admin` con Supabase Auth |
| F7 | E2E Playwright + security audit + deploy Vercel |
| F8 | Doc soporte + guion video demo |

## 10. Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # solo server
ANTHROPIC_API_KEY=
N8N_WEBHOOK_URL=                    # base
N8N_WEBHOOK_SECRET=                 # firmado HMAC
TELEGRAM_BOT_TOKEN=
TELEGRAM_OWNER_CHAT_ID=
ADMIN_PASSWORD=                     # bootstrap admin
# Email: configurado dentro de n8n (credencial Gmail OAuth o SMTP)
```

## 11. Seguridad

- RLS estricta en todas las tablas
- Webhook n8n protegido con HMAC signature en header `x-signature`
- Rate limiting en `/api/chat` y `/api/reservar` (Vercel Edge + Upstash si es necesario)
- Validación Zod en todos los inputs
- No hardcodear secrets; todo desde `process.env`
- CSP headers; `dangerouslySetInnerHTML` prohibido

## 12. Testing

- **Unit (Vitest):** validadores Zod, parsers fecha, helpers
- **E2E (Playwright):** flujo formulario completo + flujo IA simulado
- **Cobertura objetivo:** 80%+

## 13. Entregables académicos

1. URL pública Vercel
2. Prompt IA versionado en `docs/prompt-ia.md`
3. Workflows n8n en `n8n/workflows/*.json` (exports)
4. Doc soporte en `docs/arquitectura.md`
5. Guion del video demo en `docs/video-demo-guion.md`

---

## Agent Team

11 agentes en `.claude/agents/`:

| Agente | Rol |
|--------|-----|
| salon-architect | Decisiones de arquitectura, validación de cambios |
| nextjs-builder | Páginas, server actions, App Router |
| ui-animator | Framer Motion, microinteracciones, design system |
| supabase-engineer | Schema, RLS, migrations, types |
| n8n-orchestrator | Workflows vía MCP |
| ai-prompt-engineer | Prompt + tool-use Claude |
| telegram-bot-dev | Bot Telegram + envío |
| e2e-tester | Playwright |
| security-auditor | RLS + envs + validación |
| deploy-master | Vercel + checks |
| docs-writer | Doc soporte + guion video |

## Skills cargadas

`.claude/skills/`:
- `salon-domain` (nueva, dominio del negocio)
- `n8n-telegram-supabase` (nueva, recetas integración)
- `salon-ui-animations` (nueva, recetas Framer/GSAP/Lenis)
- referencias a skills globales: nextjs-app-router-patterns, frontend-patterns, ui-ux-pro-max, claude-api, postgres-patterns, e2e-testing, security-review, coding-standards, tdd-workflow

