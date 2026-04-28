-- RPC: get_proximos_dias_disponibles
-- Recorre N días desde hoy y devuelve sólo los días que tienen al menos un slot libre.
-- Útil para consultas exploratorias del agente IA (ej. "¿qué días tenés disponibles?").

create or replace function public.get_proximos_dias_disponibles(
  svc_nombre text,
  dias_a_buscar int default 7
) returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_servicio_id uuid;
  v_duracion int;
  v_today date := (now() at time zone 'America/Argentina/Cordoba')::date;
  v_dia date;
  v_dia_result jsonb;
  v_slots jsonb;
  v_first text;
  v_total int;
  v_dias_con_disp jsonb := '[]'::jsonb;
  i int;
begin
  if dias_a_buscar is null or dias_a_buscar < 1 then
    dias_a_buscar := 7;
  end if;
  if dias_a_buscar > 30 then
    dias_a_buscar := 30;
  end if;

  select id, duracion_minutos into v_servicio_id, v_duracion
  from public.servicios
  where nombre = svc_nombre and activo = true;

  if v_servicio_id is null then
    return jsonb_build_object('error', 'Servicio no encontrado: ' || svc_nombre);
  end if;

  for i in 0..(dias_a_buscar - 1) loop
    v_dia := v_today + i;
    v_dia_result := public.get_horarios_disponibles(svc_nombre, v_dia);
    v_slots := v_dia_result->'available_slots';
    v_total := jsonb_array_length(coalesce(v_slots, '[]'::jsonb));
    if v_total > 0 then
      v_first := v_slots->>0;
      v_dias_con_disp := v_dias_con_disp || jsonb_build_array(
        jsonb_build_object(
          'fecha', v_dia,
          'dia_semana', to_char(v_dia, 'TMDay'),
          'primera_hora_libre', v_first,
          'total_slots', v_total
        )
      );
    end if;
  end loop;

  return jsonb_build_object(
    'servicio', svc_nombre,
    'duracion_minutos', v_duracion,
    'rango_dias', dias_a_buscar,
    'dias_disponibles', v_dias_con_disp
  );
end;
$function$;

grant execute on function public.get_proximos_dias_disponibles(text, int) to anon, authenticated, service_role;
