-- Políticas RLS para que el admin autenticado pueda leer citas y clientes,
-- y actualizar citas (cambiar estado a 'cancelada' o 'completada').
-- El service_role bypassea RLS, por lo que el workflow de n8n no se ve afectado.

drop policy if exists "clientes_authenticated_select" on public.clientes;
create policy "clientes_authenticated_select"
  on public.clientes
  for select
  to authenticated
  using (true);

drop policy if exists "citas_authenticated_select" on public.citas;
create policy "citas_authenticated_select"
  on public.citas
  for select
  to authenticated
  using (true);

drop policy if exists "citas_authenticated_update" on public.citas;
create policy "citas_authenticated_update"
  on public.citas
  for update
  to authenticated
  using (true)
  with check (true);
