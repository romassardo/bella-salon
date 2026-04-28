-- Seed de servicios para Salón Bella
insert into public.servicios (nombre, descripcion, duracion_minutos, precio, activo) values
  ('Corte', 'Corte personalizado con lavado y secado', 45, 8000, true),
  ('Coloración', 'Color completo o reflejos profesionales', 120, 25000, true),
  ('Manicure', 'Manicure clásica con esmaltado', 45, 5000, true),
  ('Pedicure', 'Pedicure spa con hidratación', 60, 7000, true),
  ('Maquillaje social', 'Maquillaje para evento especial', 60, 12000, true),
  ('Tratamiento facial', 'Limpieza profunda + hidratación', 75, 15000, true)
on conflict do nothing;
