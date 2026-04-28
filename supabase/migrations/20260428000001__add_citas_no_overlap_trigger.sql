-- Trigger anti-overlap: rechaza un INSERT/UPDATE en citas si su rango (fecha_hora, fecha_hora + duración)
-- se solapa con otra cita activa.
-- El UNIQUE de (servicio_id, fecha_hora) sólo cubre coincidencia EXACTA. Este trigger cubre solapamiento.
-- Las cancelaciones se ignoran (estado='cancelada' no bloquea futuras reservas en ese mismo slot).

create or replace function public.check_cita_no_overlap()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_duracion int;
  v_overlap_count int;
begin
  if NEW.estado = 'cancelada' then
    return NEW;
  end if;

  select duracion_minutos into v_duracion
  from public.servicios where id = NEW.servicio_id;

  if v_duracion is null then
    raise exception 'Servicio no encontrado';
  end if;

  select count(*) into v_overlap_count
  from public.citas c
  join public.servicios s on s.id = c.servicio_id
  where c.id <> NEW.id
    and c.estado <> 'cancelada'
    and c.fecha_hora < (NEW.fecha_hora + (v_duracion || ' minutes')::interval)
    and (c.fecha_hora + (s.duracion_minutos || ' minutes')::interval) > NEW.fecha_hora;

  if v_overlap_count > 0 then
    raise exception 'Horario superpuesto con otra cita activa' using errcode = '23P01';
  end if;

  return NEW;
end;
$$;

drop trigger if exists citas_no_overlap_trigger on public.citas;
create trigger citas_no_overlap_trigger
  before insert or update on public.citas
  for each row execute function public.check_cita_no_overlap();
