-- Salón Bella — schema inicial
-- Tablas: clientes, servicios, citas, errors_log

create extension if not exists "pgcrypto";

-- ============ servicios ============
create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  duracion_minutos int not null check (duracion_minutos > 0),
  precio numeric(10,2) not null check (precio >= 0),
  imagen_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ clientes ============
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre_completo text not null,
  telefono text not null,
  email text,
  telegram_chat_id bigint,
  created_at timestamptz not null default now(),
  unique (telefono)
);

-- ============ citas ============
create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  servicio_id uuid not null references public.servicios(id) on delete restrict,
  fecha_hora timestamptz not null,
  estado text not null default 'confirmada'
    check (estado in ('confirmada','cancelada','completada')),
  medio_reserva text not null
    check (medio_reserva in ('formulario','asistente_ia')),
  notas text,
  profesional text,
  recordatorio_enviado boolean not null default false,
  created_at timestamptz not null default now()
);

-- Anti-doble-booking: no dos citas activas en mismo servicio + fecha_hora
create unique index if not exists citas_unique_servicio_fecha_activas
  on public.citas (servicio_id, fecha_hora)
  where estado <> 'cancelada';

create index if not exists citas_fecha_hora_idx on public.citas (fecha_hora);
create index if not exists citas_estado_idx on public.citas (estado);

-- ============ errors_log ============
create table if not exists public.errors_log (
  id uuid primary key default gen_random_uuid(),
  workflow text not null,
  error text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- ============ RLS ============
alter table public.servicios enable row level security;
alter table public.clientes enable row level security;
alter table public.citas enable row level security;
alter table public.errors_log enable row level security;

-- servicios: lectura pública de activos
drop policy if exists "servicios_read_active" on public.servicios;
create policy "servicios_read_active" on public.servicios
  for select using (activo = true);

-- clientes: solo service_role escribe; lectura denegada por default (admin via service_role)
-- citas: idem
-- errors_log: solo service_role
-- (no creamos policies para anon → todo denegado por default)
