-- RPC: get_horarios_disponibles
-- Devuelve los slots libres para un servicio en una fecha determinada.
-- El paso entre slots = duración del servicio (45min => cada 45min, 60 => cada hora, 120 => cada 2h).
-- Excluye slots que se solapan con citas activas existentes (overlap por duración).
-- Excluye slots en el pasado.
-- Domingo cerrado.

create or replace function public.get_horarios_disponibles(svc_nombre text, fecha date)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_duracion int;
  v_servicio_id uuid;
  v_open_h int;
  v_close_h int;
  v_dow int := extract(dow from fecha);
  v_slot_start timestamptz;
  v_slot_end timestamptz;
  v_opening timestamptz;
  v_closing timestamptz;
  v_available text[] := '{}';
  v_overlap boolean;
begin
  select id, duracion_minutos into v_servicio_id, v_duracion
  from public.servicios
  where nombre = svc_nombre and activo = true;

  if v_servicio_id is null then
    return jsonb_build_object('error', 'Servicio no encontrado: ' || svc_nombre);
  end if;

  if v_dow between 1 and 5 then
    v_open_h := 9; v_close_h := 20;
  elsif v_dow = 6 then
    v_open_h := 9; v_close_h := 18;
  else
    return jsonb_build_object(
      'servicio', svc_nombre, 'fecha', fecha, 'duracion_minutos', v_duracion,
      'available_slots', '[]'::jsonb, 'message', 'Domingo cerrado'
    );
  end if;

  v_opening := (fecha::text || ' ' || lpad(v_open_h::text, 2, '0') || ':00:00')::timestamp at time zone 'America/Argentina/Cordoba';
  v_closing := (fecha::text || ' ' || lpad(v_close_h::text, 2, '0') || ':00:00')::timestamp at time zone 'America/Argentina/Cordoba';
  v_slot_start := v_opening;

  while v_slot_start + (v_duracion || ' minutes')::interval <= v_closing loop
    v_slot_end := v_slot_start + (v_duracion || ' minutes')::interval;

    if v_slot_start >= now() then
      v_overlap := exists(
        select 1
        from public.citas c
        join public.servicios s on s.id = c.servicio_id
        where c.estado <> 'cancelada'
          and c.fecha_hora < v_slot_end
          and (c.fecha_hora + (s.duracion_minutos || ' minutes')::interval) > v_slot_start
      );

      if not v_overlap then
        v_available := array_append(v_available,
          to_char(v_slot_start at time zone 'America/Argentina/Cordoba', 'YYYY-MM-DD"T"HH24:MI:SS') || '-03:00');
      end if;
    end if;

    v_slot_start := v_slot_start + (v_duracion || ' minutes')::interval;
  end loop;

  return jsonb_build_object(
    'servicio', svc_nombre,
    'fecha', fecha,
    'duracion_minutos', v_duracion,
    'available_slots', to_jsonb(v_available)
  );
end;
$function$;

grant execute on function public.get_horarios_disponibles(text, date) to anon, authenticated, service_role;
