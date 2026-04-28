-- Política RLS para que el admin autenticado pueda leer errors_log.
-- Las INSERT del workflow de n8n usan service_role (que bypassea RLS).

drop policy if exists "errors_log_read_authenticated" on public.errors_log;

create policy "errors_log_read_authenticated"
  on public.errors_log
  for select
  to authenticated
  using (true);
