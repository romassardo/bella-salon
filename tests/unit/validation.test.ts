import { describe, it, expect } from 'vitest';
import { reservaSchema } from '@/lib/validation/schemas';

describe('reservaSchema', () => {
  const valid = {
    nombre_completo: 'Martina López',
    telefono: '+54 9 351 569 8724',
    email: 'martina@example.com',
    servicio_id: '8ee90456-7169-4b2a-be71-a8f6f07b13fe',
    fecha_hora: '2026-12-01T17:30:00-03:00',
    medio_reserva: 'formulario' as const,
  };

  it('accepts a valid reserva', () => {
    expect(reservaSchema.parse(valid)).toMatchObject({ nombre_completo: 'Martina López' });
  });

  it('rejects invalid phone', () => {
    expect(() => reservaSchema.parse({ ...valid, telefono: 'abc' })).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => reservaSchema.parse({ ...valid, email: 'not-an-email' })).toThrow();
  });

  it('rejects missing email', () => {
    const { email: _e, ...withoutEmail } = valid;
    void _e;
    expect(() => reservaSchema.parse(withoutEmail)).toThrow();
  });

  it('rejects bad uuid', () => {
    expect(() => reservaSchema.parse({ ...valid, servicio_id: '123' })).toThrow();
  });
});
