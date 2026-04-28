# M3PI: Desarrollo de aplicación web funcional (MVP)

---

## 🎓 Proyecto Integrador – Módulo 3

### 🎯 Objetivo

Desarrollar una **aplicación web funcional (MVP)** que permita a un salón de belleza recibir, gestionar y confirmar reservas de manera automática.

El sistema debe aceptar solicitudes mediante **formulario web** y mediante un **asistente IA conversacional**, registrar los datos en una base de datos Supabase, y enviar notificaciones y recordatorios automáticos a los responsables.

### ⚙️ Stack técnico

Para este proyecto vas a trabajar con el siguiente stack de herramientas:

- Supabase
- Lovable
- n8n
- API LLM
- Email / WhatsApp API (Opcional)

---

## 🏢 Contexto

**Sallon Bella** es un salón de belleza que ofrece servicios como corte, coloración, manicure y maquillaje. Hoy, todas las reservas se gestionan de forma manual por WhatsApp o Instagram. La encargada consulta disponibilidad, confirma horarios y transcribe los turnos a una agenda física.

Este método provoca:

| Problema | Consecuencia |
|----------|--------------|
| Registros manuales y desorden | Riesgo de perder citas o duplicarlas |
| Lentitud en respuestas | Clientes abandonan o buscan alternativas |
| Sin recordatorios | Alta tasa de ausencias (no-show) |
| Sin centralización | No existe historial de clientes ni seguimiento |
| Notificaciones manuales | La profesional se entera tarde del turno |

El negocio busca una solución automatizada que permita recibir reservas online, registrar datos sin intervención manual, y automatizar la comunicación con cliente y profesionales.

### Funcionalidades esperadas del sistema

- ✔ Solicitud de turnos vía formulario web y asistente IA
- ✔ Registro automático en Supabase
- ✔ Notificación automática al dueño o profesional
- ✔ Recordatorio automático horas antes del turno
- ✔ Dashboard administrativo con citas activas e historial
- ✔ Manejo de estado de cita: reservado, cancelado, completado

---

## ⚙️ Consigna Técnica

### 🛠️ Paso 1 — Entrada y Registro de Datos

**Objetivo:** Recibir solicitudes desde la web (formulario o asistente IA) y procesarlas a través de n8n para su registro en Supabase.

**Tareas:**

- **Formulario:** Crear un formulario en Lovable con los campos del modelo de datos.
- **Conexión:** Configurar el envío de Lovable hacia un Webhook de n8n (evitar conexión directa a Supabase).
- **Automatización:** Crear el workflow en n8n que reciba los datos, los mapee e inserte el registro en las tablas correspondientes.

🔎 **Salida esperada (ejemplo real):**

```json
{
  "cliente_id": "c7ed200e-ba36-4c20-bbdf-b72c8caca76d",
  "servicio_id": "8ee90456-7169-4b2a-be71-a8f6f07b13fe",
  "fecha_hora": "2025-11-29 14:30:00+00",
  "medio_reserva": "formulario",
  "estado": "confirmada"
}
```

### 💬 Paso 2 — Asistente IA para Reserva Inteligente

**Objetivo:** Permitir reservas conversacionales usando lenguaje natural.

El asistente debe ser capaz de:

- ✔ Detectar el servicio solicitado (con validación real en Supabase)
- ✔ Solicitar datos faltantes (fecha, hora, teléfono)
- ✔ Confirmar disponibilidad
- ✔ Enviar los datos a Supabase para registrar la cita

🔎 **Ejemplo de entrada del usuario:**

> "Hola, necesito un turno para manicure el viernes después de las 17."

🔎 **Respuesta del asistente IA (una vez validado y confirmada la cita):**

> Tu reserva ha sido confirmada.
> 📅 Servicio: Manicure
> 🗓 Fecha y hora: Viernes 01 de diciembre, 17:30 hs
> 📍 Salón Bella
> Recibirás un recordatorio automático antes del turno.

### 📤 Paso 3 — Notificaciones Automáticas

**Objetivo:** Informar al dueño o profesional una vez que se registra una reserva.

📤 **Ejemplo de mensaje:**

> 📢 NUEVA RESERVA CONFIRMADA
> 💅 Servicio: Manicure
> 🗓 Fecha: 01/12 – 17:30
> 👤 Cliente: Martina López
> 📞 Contacto: 3515698724
> 📎 Medio: Asistente IA

- ✔ Enviado vía email o WhatsApp automáticamente.
- ✔ Los workflows deben incluir control de errores.

### ⏰ Paso 4 — Recordatorios + Gestión de Estado

**Objetivo:** Automatizar seguimiento de cada cita.

| Acción | Automatización |
|--------|---------------|
| Recordatorio 24h antes | Email / WhatsApp con enlace |
| Cancelación | Actualiza campo estado = cancelada |
| Cita completada | Cambia estado y se registra fecha |
| Dashboard administrativo | Lista de citas activas y completadas |

---

## 📦 Entregables

Al finalizar el proyecto, deberás presentar los siguientes elementos para validar el funcionamiento:

1. **🌐 URL pública de la aplicación** — Accesible al público con formulario activo e información del negocio.
2. **💬 Prompt final del asistente IA** — Versión utilizada para interpretación y registro.
3. **🔄 JSON de workflows n8n** — Exportado completo (notificaciones, IA, recordatorios).
4. **📄 Documento soporte** — Explicación del proceso, arquitectura y herramientas.
5. **🎥 Video demo (7–8 minutos)** — Flujo completo: formulario + IA + registro + notificación.

---

## 🔧 Información adicional

### 📑 Datos mínimos requeridos

| Campo | Finalidad |
|-------|-----------|
| nombre_cliente | Identificación de cliente |
| servicio | Tipo de servicio solicitado |
| fecha_hora | Fecha y hora de la cita |
| profesional | Persona asignada (opcional) |
| telefono | Contacto para notificaciones |
| canal_reserva | Formulario o asistente IA |
| estado | Evolución de la cita |

### 🗃️ Modelo de Base de Datos Real de Supabase

#### 📘 Tabla: clientes

| Campo | Uso |
|-------|-----|
| id | Identificador único del cliente |
| nombre_completo | Usado en notificaciones y agenda |
| telefono | Permite recordatorios por WhatsApp/SMS |
| email | Para envío de confirmaciones y avisos |
| created_at | Registro histórico |

#### 💅 Tabla: servicios

| Campo | Uso |
|-------|-----|
| id | Identificador único del servicio |
| nombre | Nombre del servicio (visible en web y asistente) |
| descripcion | Información de detalle para ficha en Lovable |
| duracion_minutos | Estimación para agenda |
| precio | Comunicación y cobro |
| imagen_url | Visualización en catálogo (Lovable) |
| activo | Determina si el servicio está disponible |
| created_at | Registro histórico |

#### 📅 Tabla: citas

| Campo | Uso |
|-------|-----|
| id | Identificador único de la cita |
| cliente_id | Relación con tabla clientes |
| servicio_id | Relación con tabla servicios |
| fecha_hora | Fecha y hora agendada |
| estado | confirmado / cancelado / completado |
| medio_reserva | formulario / asistente IA |
| notas | Información adicional de cliente |
| created_at | Registro histórico |