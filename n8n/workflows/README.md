# n8n workflows

`Salon-Bella.json` — workflow exportado desde n8n Cloud que orquesta:

1. **Reserva por formulario web** (webhook `/reserva`)
2. **Chat con Bella IA** (webhook `/chat`, GPT-4o + tools de Supabase RPC)
3. **Recordatorios automáticos 24 h antes** (cron cada 30 min)
4. **Captura global de errores** (Error Trigger → `errors_log` + Telegram)

## Importar en n8n

1. n8n Cloud / self-hosted: `Workflows → Import from File → Salon-Bella.json`.
2. Las credenciales NO se exportan (placeholders). Volver a vincular:
   - **Supabase Bella Salon** (`supabaseApi`)
   - **Telegram Bella Salon** (`telegramApi`)
   - **Gmail Romassardo** (`gmailOAuth2`)
   - **Salon Bella Webhook Auth** (`httpHeaderAuth` con header `x-signature` = `N8N_WEBHOOK_SECRET`)
3. Las API keys de Supabase en los nodos `httpRequestTool` (`get_horarios_disponibles`, `get_proximos_dias_disponibles`) están redactadas como `<REDACTED_SUPABASE_ANON_KEY>`. Reemplazar por la anon key del proyecto al importar.
4. Activar el workflow después de re-cablear credenciales.

## Notas

- El workflow tiene 45 nodos (4 sticky notes documentando cada flujo + 41 nodos funcionales).
- El system message del Agente Bella usa expresión `{{ $now.setZone('America/Argentina/Cordoba')... }}` con prefijo `=` — no quitar el `=` o el modelo cae en su training cutoff.
- Schema del Output Parser exige JSON estricto con campos nullable; ver `Bella Output` node.
