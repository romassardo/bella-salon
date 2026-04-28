-- Renombra el flag existente y agrega el de 2h
alter table public.citas rename column recordatorio_enviado to recordatorio_24h_enviado;
alter table public.citas add column if not exists recordatorio_2h_enviado boolean not null default false;

-- Índice para acelerar la query del cron
create index if not exists citas_recordatorios_idx on public.citas (estado, fecha_hora) where estado = 'confirmada';
