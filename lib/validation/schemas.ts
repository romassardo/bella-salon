import { z } from 'zod';

const PHONE_REGEX = /^[\d\s+()-]{8,20}$/;
const NAME_REGEX = /^[\p{L}\p{M}\s'.-]{2,80}$/u;

export const reservaSchema = z.object({
  nombre_completo: z
    .string()
    .trim()
    .min(2, 'Nombre demasiado corto')
    .max(80)
    .regex(NAME_REGEX, 'Nombre inválido'),
  telefono: z.string().trim().regex(PHONE_REGEX, 'Teléfono inválido'),
  email: z.string().trim().email('Email inválido').max(120),
  servicio_id: z.string().uuid('Servicio inválido').optional(),
  servicio_nombre: z.string().min(2).max(40).optional(),
  fecha_hora: z.string().datetime({ offset: true, message: 'Fecha inválida' }),
  notas: z.string().max(500).optional(),
  medio_reserva: z.enum(['formulario', 'asistente_ia']),
}).refine((d) => d.servicio_id || d.servicio_nombre, {
  message: 'Debe especificar servicio_id o servicio_nombre',
  path: ['servicio_id'],
});

export type ReservaInput = z.infer<typeof reservaSchema>;

export const chatRequestSchema = z.object({
  sessionId: z.string().min(8).max(64),
  message: z.string().min(1).max(2000),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

export const servicioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  duracion_minutos: z.number().int().positive(),
  precio: z.number().nonnegative(),
  imagen_url: z.string().url().nullable(),
  activo: z.boolean(),
});

export type Servicio = z.infer<typeof servicioSchema>;
