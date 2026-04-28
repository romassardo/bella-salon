-- RPC: buscar_cita_proxima_cliente
-- Helper para futura feature de cancelación/reagendamiento desde el chat IA.
-- Hoy NO se usa: el agente deriva las cancelaciones a canales humanos (WhatsApp/email).
-- Se mantiene la función disponible por si se decide cablear la feature en el agente.

create or replace function public.buscar_cita_proxima_cliente(
  p_nombre text,
  p_servicio text default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_row record;
  v_pattern text := '%' || trim(p_nombre) || '%';
begin
  if p_nombre is null or btrim(p_nombre) = '' then
    return jsonb_build_object('error', 'Falta el nombre del cliente');
  end if;

  select c.id, c.fecha_hora, c.estado, s.nombre as servicio, cl.nombre_completo
    into v_row
  from public.citas c
  join public.clientes cl on cl.id = c.cliente_id
  join public.servicios s  on s.id  = c.servicio_id
  where c.estado = 'confirmada'
    and c.fecha_hora > now()
    and cl.nombre_completo ilike v_pattern
    and (p_servicio is null or s.nombre ilike '%' || trim(p_servicio) || '%')
  order by c.fecha_hora asc
  limit 1;

  if v_row.id is null then
    return jsonb_build_object(
      'encontrada', false,
      'mensaje', 'No encontré ninguna cita confirmada futura para ese cliente'
    );
  end if;

  return jsonb_build_object(
    'encontrada', true,
    'cita_id', v_row.id,
    'cliente', v_row.nombre_completo,
    'servicio', v_row.servicio,
    'fecha_hora', v_row.fecha_hora,
    'fecha_legible', to_char(v_row.fecha_hora at time zone 'America/Argentina/Cordoba',
                             'TMDay DD "de" TMMonth, HH24:MI" hs"')
  );
end;
$function$;

grant execute on function public.buscar_cita_proxima_cliente(text, text) to anon, authenticated, service_role;
