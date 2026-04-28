# Salón Bella — Design System (MASTER) · v2 Brutalism Editorial

**Source of truth visual.** Adaptado del handoff `design_handoff_bella_salon`. Estética: Brutalismo glossy / Y2K editorial.

## Pattern
Single-page landing con secciones encadenadas: Nav → Hero → Marquee → About → Catálogo → Asistente → Reserva → Footer.

## Tokens

```css
:root {
  --ink:    #0E0B0A;   /* texto principal, fondos oscuros */
  --paper:  #F2EDE6;   /* fondo principal (crema) */
  --cream:  #E8E0D2;   /* superficies sutiles */
  --hot:    #FF3B2F;   /* coral, acento principal CTAs */
  --acid:   #D6FF3F;   /* lima, acento secundario / confirmaciones */
  --rose:   #FF8FA3;
  --lilac:  #C8A8FF;
  --sky:    #8AD8FF;
  --char:   #1A1614;

  --shadow-brutal:    6px 6px 0 var(--ink);
  --shadow-brutal-sm: 3px 3px 0 var(--ink);
  --shadow-soft:      0 30px 60px -20px rgba(14,11,10,0.35);

  --ease: cubic-bezier(.32,.72,0,1);
}
```

Contraste verificado: `--ink` sobre `--paper` cumple AAA. `--acid` sobre `--ink` cumple AA — usar solo en elementos grandes / no body text.

## Tipografía

- **Display (h1-h2, hero, marquee):** Fraunces — italic permitido, weight 400-600, letter-spacing -0.04em, line-height 0.88
- **Body + UI:** Inter Tight — weight 400/500/600, line-height 1.4
- **Labels, mono UI, timestamps:** JetBrains Mono — weight 400/500, letter-spacing 0.1em, uppercase

```css
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500;1,9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
```

En este proyecto se cargan vía `next/font` en `app/layout.tsx` y se exponen como variables `--font-serif`, `--font-sans`, `--font-mono`.

## Espaciado

Padding base de secciones: 18vh vertical (about, asistente, reservar) o 80px (catálogo, footer). Hero: 88px top / 28px lados. Mobile: 12vh / 18px.

## Border radius

- Pills: 999px
- Cards: 24-28px
- Sheets (catálogo, footer): `32px 32px 0 0` (solo top)
- Phone shell: 44px outer, 32px inner

## Sombras

- `--shadow-brutal`: 6px 6px 0 ink (offset duro)
- `--shadow-brutal-sm`: 3px 3px 0 ink
- `--shadow-soft`: 0 30px 60px -20px rgba ink/35% (cards y phone)

## Animaciones críticas

| Elemento | Tipo | Duración | Easing |
|---|---|---|---|
| Hero words | translateY(110% → 0) | 1100ms | var(--ease) |
| Chrome blobs | rotate 360deg | 22-32s | linear infinite |
| Marquee | translateX(0 → -50%) | 35s | linear infinite |
| About words | opacity 0.18 → 1, stagger 60ms | 600ms cada | var(--ease) |
| Catalog crossfade | opacity + scale | 600/1200ms | var(--ease) |
| Phone shell | rotate(-2.5deg → 0) on hover | 500ms | var(--ease) |
| Bubble in | translateY(6px) scale(0.96) → 0/1 | 380ms | var(--ease) |
| Typing dots | translateY(0 → -3px) loop | 1.2s | ease-in-out |
| Nav scrolled | bg + blur fade | 320ms | var(--ease) |
| Confirm ring | scale 0.5 → 1 + check draw | 600ms | var(--ease) |

Todas respetan `prefers-reduced-motion: reduce`.

## Componentes (en `components/salon/`)

- `Nav.tsx` (client) — fixed; transparente → blur al scroll >40px; reloj live
- `Hero.tsx` (server) — chrome blobs + título 18vw + CTAs
- `Marquee.tsx` (server) — banda ink con servicios infinitos
- `About.tsx` (client) — IntersectionObserver enciende palabras
- `Catalog.tsx` (client) — tabs + crossfade de imagen + info
- `Assistant.tsx` (client) — phone mockup; chat conectado a `/api/chat`
- `Booking.tsx` (client) — 4 pasos; submit a `/api/reservar` (n8n webhook)
- `Footer.tsx` (server) — mega título + grid 4 cols

## Accesibilidad

- Mantener contraste WCAG AA mínimo
- Todos los inputs con `<label htmlFor>`
- Focus visible (outline 2px `--ink` con offset 3px) en CTAs y campos
- `aria-label` en botones-icono (send, etc)
- `aria-live` opcional en chat para anuncios
- Touch targets ≥44px

## Anti-patterns (PROHIBIDO)

- Cambiar tipografía sin actualizar este MASTER
- Usar emojis estructurales — solo ✨ en mensajes de Bella, con moderación
- Animar `width`/`height`/`top`/`left` (usar transform/opacity)
- Quitar el `grain` overlay (define la textura del salón)
- Colorear textos largos en `--acid` o `--hot` (contraste insuficiente)
