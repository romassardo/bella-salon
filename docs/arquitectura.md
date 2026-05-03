# Documento de Arquitectura — Salón Bella

**Proyecto:** Módulo 3 — Proyecto Integrador  
**Fecha:** 2026-05-03  
**URL producción:** https://salon-bella-eight.vercel.app  
**Repositorio:** https://github.com/romassardo/bella-salon

---

## 1. Descripción general

Salón Bella es un MVP de reservas online para un salón de belleza ficticio. El sistema permite recibir turnos mediante dos canales (formulario web y asistente IA), registrarlos automáticamente en base de datos, notificar a la dueña por Telegram, confirmar al cliente por email y enviar recordatorios automáticos 24 horas antes del turno.

---

## 2. Stack tecnológico

| Capa | Tecnología | Rol |
|---|---|---|
| Frontend | Next.js 15 (App Router) | Interfaz web, SSR, API routes |
| Estilos | Tailwind CSS v4 + shadcn/ui | Design system, componentes |
| Animaciones | Framer Motion + GSAP + Lenis | Microinteracciones, scroll suave |
| Base de datos | Supabase (PostgreSQL) | Datos, RLS, RPCs, Auth |
| Orquestación | n8n Cloud v2.17.5 | Automatización de flujos y webhooks |
| IA | OpenAI GPT-4o (vía n8n) | Asistente conversacional |
| Notificaciones | Telegram Bot API | Alertas a la dueña |
| Email | Gmail OAuth2 (vía n8n) | Confirmaciones y recordatorios |
| Deploy | Vercel | Hosting serverless del frontend |
| Stack swap | Claude Code (≠ Lovable), Telegram (≠ WhatsApp) | Mayor control técnico, sin costo de meta |

---

## 3. Diagrama de arquitectura

```
┌──────────────────────────────────────────────────┐
│            Vercel (Next.js 15 SSR)               │
│                                                  │
│  /          → Landing + Catálogo + Booking Form  │
│  /admin     → Dashboard (Supabase Auth)          │
│  /api/chat      → Proxy webhook /chat (HMAC)     │
│  /api/reservar  → Proxy webhook /reserva (HMAC)  │
│  /api/horarios  → Supabase RPC directo           │
└──────────────────┬───────────────────────────────┘
                   │ POST firmado con HMAC
                   │ header: x-signature
                   ▼
┌──────────────────────────────────────────────────┐
│         n8n Cloud (rodfloyd75.app.n8n.cloud)     │
│                                                  │
│  Flujo 1: Webhook /reserva                       │
│    → Buscar Servicio → Buscar/Crear Cliente      │
│    → Guardar Cita → Armar Mail+ICS               │
│    → Enviar Mail (confirmación siempre)          │
│    → Telegram dueña → Responder webhook          │
│                                                  │
│  Flujo 2: Webhook /chat                          │
│    → AI Agent (GPT-4o) con 2 tools Supabase     │
│    → ¿ready_to_book? → subflujo booking          │
│    → Responder al chat                           │
│                                                  │
│  Flujo 3: Cron cada 30 min                       │
│    → Buscar citas de mañana                      │
│    → Enviar mail recordatorio                    │
│    → Marcar recordatorio_enviado = true          │
│                                                  │
│  Flujo 4: Error Trigger                          │
│    → errors_log (Supabase) + Telegram dueña      │
└──────┬──────────────┬──────────────┬─────────────┘
       │              │              │
       ▼              ▼              ▼
  Supabase       Telegram Bot     Gmail OAuth2
  PostgreSQL     (chat_id dueña)  (romassardo)
  + RLS + Auth   658942831
```

---

## 4. Base de datos (Supabase)

**Proyecto:** `vqkzghdqtevncyycloxv` — Bella Salon

### Tablas

#### `servicios`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid PK | Identificador |
| nombre | text | Nombre del servicio (ej. "Coloración") |
| descripcion | text | Detalle visible en catálogo |
| duracion_minutos | int | Usado para calcular fin de turno y slots |
| precio | numeric(10,2) | Precio en ARS |
| imagen_url | text | URL de imagen para tarjeta del catálogo |
| activo | boolean | Si aparece en el catálogo |
| created_at | timestamptz | Registro |

#### `clientes`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid PK | Identificador |
| nombre_completo | text | Nombre del cliente |
| telefono | text UNIQUE | Llave natural de upsert |
| email | text | Para confirmaciones |
| created_at | timestamptz | Registro |

#### `citas`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid PK | Identificador |
| cliente_id | uuid FK | Referencia a clientes |
| servicio_id | uuid FK | Referencia a servicios |
| fecha_hora | timestamptz | Inicio del turno |
| estado | text | `confirmada` / `cancelada` / `completada` |
| medio_reserva | text | `formulario` / `asistente_ia` |
| notas | text | Notas adicionales del cliente |
| recordatorio_enviado | boolean | Marca del cron de recordatorios |
| created_at | timestamptz | Registro |

#### `errors_log`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid PK | Identificador |
| workflow | text | Nombre del workflow n8n |
| node | text | Nodo donde ocurrió el error |
| message | text | Mensaje de error |
| payload | jsonb | Datos del momento del error |
| created_at | timestamptz | Registro |

### Funciones RPC

```sql
-- Slots disponibles para un servicio en una fecha dada
-- Paso = duración del servicio (45min → cada 45min, 120min → cada 2h)
get_horarios_disponibles(svc_nombre text, fecha date)
  RETURNS jsonb

-- Días con al menos un slot libre en los próximos N días
get_proximos_dias_disponibles(svc_nombre text, dias_a_buscar int)
  RETURNS jsonb
```

### Trigger anti-solapamiento

```sql
-- BEFORE INSERT/UPDATE en citas
-- Rechaza si hay otra cita activa cuyo rango (fecha_hora, fecha_hora + duracion)
-- se superpone con la nueva
citas_no_overlap_trigger
```

### Row Level Security

| Tabla | SELECT | INSERT | UPDATE |
|---|---|---|---|
| `servicios` | Público (activos) | Service role | Service role |
| `clientes` | Authenticated | Service role | Service role |
| `citas` | Authenticated | Service role | Service role |
| `errors_log` | Authenticated | Service role (bypass RLS) | — |

---

## 5. Workflows n8n

El workflow `wf-salon-bella` contiene **45 nodos** organizados en 4 flujos internos, cada uno documentado con sticky notes en n8n.

### Flujo 1 — Reserva por formulario web

```
Webhook /reserva
  → Verificar Firma HMAC
  → Buscar Servicio en Catálogo (Supabase)
  → Buscar Cliente (por teléfono) / Crear si no existe
  → Guardar Cita en Supabase
  → Armar Plantillas (HTML email + ICS + Telegram)
  → Enviar Mail Confirmación (Gmail OAuth2 + adjunto turno.ics)
  → Avisar a la Dueña por Telegram
  → Responder al Webhook (JSON con cita_id + reply)
```

### Flujo 2 — Chat con Bella IA

```
Webhook /chat
  → Preparar Datos del Formulario
  → Agente Bella (GPT-4o, tools: get_horarios / get_proximos_dias)
  → Output Parser (JSON Schema estricto)
  → ¿ready_to_book? true/false
    true  → [mismo subflujo de booking que Flujo 1]
          → Confirmar Reserva al Chat
    false → Responder al Chat (reply del agente)
  → Avisar Conflicto si overlap en DB
```

### Flujo 3 — Recordatorios automáticos 24h

```
Cron cada 30 min
  → Buscar Citas de Mañana (fecha_hora entre now()+23h y now()+25h,
    recordatorio_enviado = false)
  → [para cada cita] Armar Mail Recordatorio
  → Enviar Mail Recordatorio (Gmail)
  → Marcar recordatorio_enviado = true (Supabase)
```

### Flujo 4 — Captura global de errores

```
Error Trigger (cualquier nodo falla)
  → Guardar Error en errors_log (Supabase, vía service_role)
  → Avisar a la Dueña por Telegram (mensaje con contexto del error)
```

---

## 6. Frontend (Next.js 15)

### Páginas

| Ruta | URL producción | Tipo | Descripción |
|---|---|---|---|
| `/` | https://salon-bella-eight.vercel.app | Static | Landing: Hero, catálogo (6 servicios), formulario de reserva 4 pasos, chat Bella, footer |
| `/admin` | https://salon-bella-eight.vercel.app/admin | Dynamic (SSR) | Dashboard administrativo (requiere login) |
| `/admin/login` | https://salon-bella-eight.vercel.app/admin/login | Static | Login con Supabase Auth |

### Dashboard administrativo

Acceso: https://salon-bella-eight.vercel.app/admin  
Autenticación: Supabase Auth (email + contraseña). Solo usuarios registrados en el proyecto Supabase pueden ingresar.

El dashboard tiene tres secciones organizadas en tabs:

#### Tab Financiera
- **Gráfico de barras** (Recharts): ingresos por servicio en los últimos 30 días, con tooltip de valor exacto en ARS
- **Tabla de desglose**: servicio, cantidad de citas, precio unitario e ingreso total
- **Stat card**: ingresos del día actual

#### Tab Operativa
- **Gráfico de línea** (Recharts): citas por día en los últimos 30 días
- **Ranking de servicios**: los más solicitados con barra de progreso proporcional
- **Desglose por canal**: proporción de reservas vía formulario vs asistente IA

#### Lista de citas
- Listado completo de citas con: nombre del cliente, servicio, fecha/hora, canal de reserva y estado (`confirmada` / `cancelada` / `completada`)
- **Acciones por cita**: marcar como completada o cancelar (actualiza `estado` en Supabase en tiempo real)
- Filtros por estado y ordenamiento por fecha

### API Routes (proxy a n8n)

| Ruta | Método | Descripción |
|---|---|---|
| `/api/chat` | POST | Proxy firmado (HMAC SHA-256) al webhook `/chat` de n8n |
| `/api/reservar` | POST | Proxy firmado al webhook `/reserva` de n8n + validación Zod |
| `/api/horarios` | GET | Consulta directa a RPC `get_horarios_disponibles` de Supabase |
| `/api/admin/citas/[id]/cancel` | PATCH | Actualiza `estado = 'cancelada'` en Supabase (requiere sesión) |

### Seguridad

- Headers HTTP: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
- Webhook HMAC: `x-signature = HMAC-SHA256(body, N8N_WEBHOOK_SECRET)` verificado en n8n
- Validación Zod en todos los API routes del lado servidor
- Variables server-only (`SUPABASE_SERVICE_ROLE_KEY`, `N8N_WEBHOOK_SECRET`) nunca expuestas al cliente
- RLS de Supabase como segunda línea de defensa

---

## 7. Email de confirmación

El mail que recibe el cliente incluye:
- HTML con diseño Salón Bella (tipografía Fraunces + JetBrains Mono, paleta rosé)
- Datos completos de la reserva (servicio, fecha/hora, dirección)
- Badge "✓ Reserva confirmada"
- Botón "+ Google Calendar" (deep-link a calendar.google.com)
- Adjunto `turno.ics` (compatible con iOS, Apple Calendar, Outlook)

---

## 8. Deploy

| Servicio | Detalle |
|---|---|
| Vercel | Proyecto `salon-bella`, team `rodrigos-projects-371b3e24` |
| GitHub | `romassardo/bella-salon` — push a `main` → deploy automático |
| Next.js | 15.3.9 (actualizado desde 15.1.7 por CVE-2025-29927) |
| Env vars en Vercel | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET` |

---

## 9. Divergencias respecto a la consigna original

| Consigna | Implementación | Justificación |
|---|---|---|
| Lovable | Next.js 15 + Claude Code | Mayor control sobre UI, deploy en Vercel, animaciones con Framer Motion |
| WhatsApp API | Telegram Bot API | Sin costo, sin verificación de Meta, integración directa con n8n |
| Email opcional | Email obligatorio (siempre al reservar) | Mejor UX: cliente recibe confirmación inmediata + recordatorio 24h |

Todas las funcionalidades requeridas por la consigna están implementadas:
- ✅ Formulario web con registro automático en Supabase
- ✅ Asistente IA conversacional (GPT-4o vía n8n)
- ✅ Notificación automática a la dueña (Telegram)
- ✅ Recordatorio automático 24h antes (email vía cron n8n)
- ✅ Dashboard administrativo con citas activas e historial
- ✅ Manejo de estados: confirmada / cancelada / completada
