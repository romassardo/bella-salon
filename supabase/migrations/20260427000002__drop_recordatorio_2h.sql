-- Decisión académica: solo recordatorio 24h por email al cliente.
alter table public.citas drop column if exists recordatorio_2h_enviado;
