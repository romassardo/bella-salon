# Salón Bella

MVP de reservas para un salón de belleza ficticio en CABA. Recibe turnos por **formulario web** y por un **asistente IA conversacional**, persiste todo en Supabase, manda confirmación por mail con archivo de calendario adjunto, y avisa a la dueña por Telegram. Proyecto Integrador del Módulo 3.

---

## Stack

- **Next.js 15** (App Router, RSC, Tailwind v4)
- **Supabase** (Postgres + Auth + RLS) — schema, RPCs y triggers en [`supabase/migrations/`](supabase/migrations/)
- **n8n Cloud** — orquestación de chat IA, mails, Telegram y cron de recordatorios. Workflow exportado en [`n8n/workflows/`](n8n/workflows/)
- **OpenAI GPT-4o** + fallback **gpt-4o-mini** (corriendo dentro de n8n vía AI Agent + Output Parser estructurado)
- **Telegram Bot** (notificaciones a la dueña + alertas de error)
- **Gmail API** (mail de confirmación con `.ics` adjunto y botón Google Calendar)
- **Vercel** (deploy)

---

## Quick start

```bash
pnpm install
cp .env.example .env.local         # completar variables (ver abajo)
pnpm dev                           # http://localhost:3000
```

### Variables de entorno requeridas

Ver [`.env.example`](.env.example). Las credenciales de OpenAI / Telegram / Gmail viven dentro de **n8n** (no en `.env.local`).

### Migraciones de DB

```bash
# con la CLI oficial de Supabase
supabase db push
```

### Importar workflow en n8n

Ver [`n8n/workflows/README.md`](n8n/workflows/README.md). Las API keys de Supabase en el JSON están redactadas — re-cablear credenciales después del import.

---

## Estructura del repo

```
.
├── app/                    rutas Next.js (App Router)
│   ├── api/                endpoints: chat, reservar, horarios, admin
│   └── admin/              panel admin con Supabase Auth
├── components/
│   ├── salon/              Hero, Catalog, Booking form, Assistant chat...
│   └── admin/              componentes del panel
├── lib/
│   ├── ai/prompt.ts        prompt versionado del agente Bella (source-of-truth)
│   ├── n8n/client.ts       fetch helper para los webhooks
│   ├── supabase/           clients server/browser + types generados
│   └── validation/         schemas Zod
├── supabase/migrations/    schema + RPCs + RLS + triggers
├── n8n/workflows/          export JSON del workflow de n8n
├── design-system/          tokens y reglas de diseño (MASTER.md)
├── docs/                   spec original y consigna académica
└── tests/                  unit (Vitest) y E2E (Playwright)
```

---

## Scripts

| Script | Qué hace |
|--------|----------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Build producción |
| `pnpm start` | Servir build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm db:types` | Regenera types desde Supabase |

---

## Arquitectura en una línea

`Cliente` → (form o chat) → `Next.js API` → `n8n webhook` → `[GPT-4o + Supabase RPCs]` → `Postgres` → `Mail/Telegram/Calendar`

---

## Estado del proyecto

- F1–F6: ✅ Done
- F7 (deploy Vercel + security review): 🔜 siguiente
- F8 (docs académicas + video): pospuesto post-deploy

---

## Licencia

Proyecto académico. Sin licencia comercial. Código provisto como-está para evaluación del Módulo 3.
