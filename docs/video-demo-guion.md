# Guion Video Demo — Salón Bella

**Duración objetivo:** 8–9 minutos  
**Fecha:** 2026-05-06  
**URL:** https://salon-bella-eight.vercel.app

---

## Estructura general

| Segmento | Tiempo |
|---|---|
| Introducción | 0:00 – 0:45 |
| Landing y catálogo | 0:45 – 1:45 |
| Reserva por formulario | 1:45 – 3:15 |
| Asistente IA (Bella) | 3:15 – 5:00 |
| Dashboard admin (login + tabs + usuarios) | 5:00 – 7:00 |
| n8n + Supabase (backstage) | 7:00 – 8:00 |
| Cierre | 8:00 – 8:30 |

---

## Segmento 1 — Introducción (0:00 – 0:45)

**Qué mostrar:** pantalla en negro o logo, voz en off.

> "Hola, les presento Salón Bella, mi proyecto integrador del Módulo 3. El objetivo fue automatizar el sistema de reservas de un salón de belleza, reemplazando la gestión manual por WhatsApp con una aplicación web que combina formulario web, un asistente de IA, notificaciones automáticas y un panel de administración."

> "El stack que usé: Next.js 15 en Vercel para el frontend, Supabase como base de datos con Row Level Security, n8n para automatizar todos los flujos, GPT-4o como modelo de lenguaje del asistente, Telegram para las notificaciones a la dueña, y Gmail para los mails al cliente."

---

## Segmento 2 — Landing y catálogo (0:45 – 1:45)

**Qué mostrar:** abrir https://salon-bella-eight.vercel.app en el navegador.

> "Esta es la landing page. Tiene animaciones con Framer Motion y scroll suave con Lenis."

- Scrollear lentamente por el Hero, mostrar el título animado y los dos CTAs
- Scrollear hasta el catálogo de servicios

> "Acá están los 6 servicios disponibles con precio, duración y descripción. El cliente puede reservar desde el formulario o usar el asistente IA directamente."

- Mostrar las tarjetas del catálogo con el hover effect

---

## Segmento 3 — Reserva por formulario (1:45 – 3:15)

**Qué mostrar:** scrollear hasta el formulario de reserva.

> "El formulario tiene 4 pasos: primero se elige el servicio..."

- **Paso 1:** hacer click en "Coloración" (u otro servicio)

> "...luego la fecha y el horario. Los horarios se consultan en tiempo real desde Supabase, respetando la duración de cada servicio y sin mostrar turnos ocupados."

- **Paso 2:** elegir una fecha disponible → mostrar cómo aparecen los slots reales
- Elegir un slot horario

> "...después los datos personales."

- **Paso 3:** completar nombre, teléfono y email (usar datos ficticios)

> "...y finalmente la confirmación."

- **Paso 4:** mostrar la pantalla de éxito con animación

> "En este momento n8n recibió el webhook, registró al cliente y la cita en Supabase, le mandó el mail de confirmación con el adjunto .ics para agregar al calendario, y le avisó a la dueña por Telegram."

- Mostrar brevemente el mail recibido (si está disponible para la demo)

---

## Segmento 4 — Asistente IA Bella (3:15 – 5:00)

**Qué mostrar:** scrollear hasta la sección del chat en la landing.

> "El segundo canal es el asistente IA, Bella. Es un agente GPT-4o que corre dentro de n8n, con acceso a dos herramientas: una para ver slots de un día puntual y otra para explorar disponibilidad de la semana."

**Conversación demo sugerida:**

1. Escribir: `Hola, quiero un manicure para esta semana`
   - Bella responde consultando los próximos días disponibles
   
2. Elegir un día: `El jueves me viene bien`
   - Bella muestra los slots disponibles para ese día
   
3. Elegir horario: `A las 15`
   - Bella confirma y pide los datos

4. Dar datos: `Lucía Fernández, 1144556677, luci@mail.com`
   - Bella muestra el resumen

5. Confirmar: `Sí, confirmado`
   - Aparece la tarjeta verde de confirmación

> "Cuando el asistente recibe el 'sí' del cliente, n8n registra la cita exactamente igual que con el formulario: misma base de datos, mismo mail, mismo Telegram."

> "El prompt fue iterado varias veces para resolver problemas de alucinaciones —el modelo inventaba horarios sin consultar la base— y de persistencia de datos entre turnos del chat."

---

## Segmento 5 — Dashboard admin (5:00 – 7:00)

**Qué mostrar:** navegar a https://salon-bella-eight.vercel.app/admin/login

> "El panel administrativo requiere login con Supabase Auth. Hay dos roles: la **dueña** (`owner`) ve todo, y los **empleados** (`staff`) solo ven la lista de citas para gestionarlas."

- Mostrar la pantalla de login y, brevemente, el link **"Olvidé mi contraseña"**

> "Si un empleado olvida su clave, desde acá pide un reset y Supabase le manda el mail con el link a `/admin/reset-password` para definir una nueva."

- Hacer login con las credenciales de la dueña

> "Como entré como dueña, veo las cuatro tabs: Citas, Operativa, Financiera y Usuarios."

### Tab Citas

- **Lista de citas:** mostrar las citas recientes con cliente, servicio, fecha, canal y estado

> "Desde acá se puede marcar una cita como completada o cancelarla. Todo actualiza en tiempo real en Supabase."

- Mostrar el menú de acciones de una cita (cancelar / completar)

### Tab Operativa

- Mostrar el gráfico de citas por día (últimos 30 días), el ranking de servicios más pedidos y el desglose por canal (formulario vs IA)

### Tab Financiera

- Mostrar el gráfico de barras de ingresos por servicio, las stat cards (ingresos del mes, ticket promedio, citas cobradas, monto perdido) y la tabla de desglose

### Tab Usuarios (solo dueña)

> "La dueña también administra los accesos al panel desde la tab Usuarios."

- Mostrar el listado: email, nombre, rol y fecha de creación
- Hacer click en **"Crear empleado"**, completar email + nombre y enviar

> "Cuando creo un empleado, el sistema genera un usuario en Supabase Auth con una contraseña temporal del estilo `Bella-XXXX` y me la muestra una sola vez para que se la pase al empleado. La primera vez que entra, usa 'Olvidé mi contraseña' para definir la suya."

- Resaltar la contraseña temporal mostrada en pantalla
- (Opcional) Mostrar el botón eliminar de un empleado de prueba

> "El backend valida en cada request que el usuario tenga rol `owner` antes de permitir crear o eliminar usuarios — no alcanza con el chequeo del frontend."

---

## Segmento 6 — Backstage: n8n y Supabase (7:00 – 8:00)

**Qué mostrar:** abrir n8n en otra pestaña (rodfloyd75.app.n8n.cloud).

> "Detrás de escena, todo lo orquesta n8n. El workflow tiene 45 nodos organizados en 4 flujos."

- Mostrar el canvas de n8n con los 4 flujos visibles y las sticky notes descriptivas

> "El Flujo 1 recibe las reservas del formulario. El Flujo 2 es el chat con la IA. El Flujo 3 es el cron de recordatorios que corre cada 30 minutos y avisa 24 horas antes de cada turno. Y el Flujo 4 captura cualquier error y lo notifica por Telegram."

- Hacer zoom brevemente en el AI Agent del Flujo 2 para mostrar el nodo GPT-4o

> "Y acá está Supabase."

- Abrir Supabase Table Editor → tabla `citas`
- Mostrar las reservas registradas, incluyendo las que acaban de entrar

> "Cada reserva tiene su cliente, servicio, fecha, canal de origen y estado. Los recordatorios también se marcan acá automáticamente."

---

## Segmento 7 — Cierre (8:00 – 8:30)

> "En resumen: Salón Bella reemplaza la gestión manual por un sistema completamente automatizado. El cliente puede reservar por formulario o por chat de IA, recibe confirmación por mail con archivo de calendario, y la dueña recibe la alerta por Telegram al instante."

> "El sistema está deployado en Vercel en producción. El código está en GitHub y el workflow de n8n exportado en el repositorio."

> "Gracias."

---

## Checklist pre-grabación

- [ ] Borrar citas de prueba acumuladas en la DB para que el demo sea limpio
- [ ] Verificar que el workflow de n8n está activo
- [ ] Verificar que llegan mails (enviar uno de prueba antes)
- [ ] Verificar que llegan Telegrams a la dueña
- [ ] Tener el mail del admin listo para mostrar (o no mostrar si es privado)
- [ ] Resolución de pantalla: 1920×1080 mínimo
- [ ] Micrófono probado
- [ ] Cerrar Slack, notificaciones del sistema

---

## Datos ficticios para la demo

Para no exponer datos reales durante la grabación:

| Campo | Valor |
|---|---|
| Nombre cliente | Lucía Fernández |
| Teléfono | 1144556677 |
| Email | luci.fernandez.demo@mail.com |
| Servicio | Manicure o Coloración |
| Fecha | el jueves / viernes próximo |
