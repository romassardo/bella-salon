# Admin BI Dashboard — Spec de Diseño

**Fecha:** 2026-04-28
**Proyecto:** Salón Bella
**Alcance:** Extensión del panel admin con dos pestañas nuevas (Financiera y Operativa) y mejora mínima de la pestaña existente (Citas).

---

## 1. Objetivo

Añadir información de negocio útil al dashboard de administración manteniendo la estética editorial/brutalista actual. El proyecto es académico, por lo que se prioriza simplicidad sobre escala.

---

## 2. Estructura de pestañas

```
[ Citas ]  [ Financiera ]  [ Operativa ]
```

- **Citas** (existente): tabla de turnos con filtros. Se agrega el stat "Ingresos hoy".
- **Financiera** (nueva): métricas económicas con selector mes/año y gráfico de barras.
- **Operativa** (nueva): métricas de rendimiento con gráfico de evolución de citas.

---

## 3. Tab Citas (mejora mínima)

### Stats actuales + nuevo
| Stat | Descripción |
|---|---|
| Hoy | Cantidad de citas activas hoy (sin cambios) |
| Próximas | Citas futuras confirmadas (sin cambios) |
| Canceladas | Total canceladas (sin cambios) |
| Total | Total en base de datos (sin cambios) |
| **Ingresos hoy** *(nuevo)* | Suma de `servicios.precio` de citas confirmadas/completadas de hoy |

El resto (filtros, tabla, acción cancelar) queda sin cambios.

---

## 4. Tab Financiera

### Selector
- Dropdowns de **Mes** y **Año** en la parte superior.
- Por defecto: mes y año actuales.
- El filtrado es client-side sobre los datos ya cargados.

### Stats (cards)
| Stat | Cálculo |
|---|---|
| Ingresos del mes | Suma de `servicios.precio` de citas confirmadas/completadas en el período |
| Ticket promedio | `ingresos / cantidad_citas_cobradas` |
| Citas cobradas | Cantidad de citas confirmadas o completadas en el período |
| Monto perdido | Suma de `servicios.precio` de citas canceladas en el período |

### Gráfico de barras — Recharts `BarChart`
- Eje X: nombre del servicio
- Eje Y: ingreso total del período
- Color de barras: `var(--color-acid)`
- Borde de barras: `var(--color-ink)` 2px
- Sin bordes redondeados (`radius={0}`)
- Tooltip con formato ARS

### Tabla: desglose por servicio
| Columna | Descripción |
|---|---|
| Servicio | Nombre |
| Citas | Cantidad en el período |
| Ingreso | Suma de precios |
| % del total | Porcentaje sobre ingresos totales del período |

---

## 5. Tab Operativa

### Stats (cards — sin filtro de fecha, vista global)
| Stat | Cálculo |
|---|---|
| Tasa de cancelación | `canceladas / total * 100` (todas las citas) |
| Canal dominante | "IA" o "Formulario" según cuál tiene más citas |
| Servicio top | Nombre del servicio con más citas confirmadas/completadas |
| Clientes nuevos (mes) | Cantidad de registros en `clientes` con `created_at` en el mes actual |

### Gráfico de línea — Recharts `LineChart`
- Últimos 6 meses (agrupado por mes)
- Eje X: "Ene", "Feb", etc.
- Eje Y: cantidad de citas (excluye canceladas)
- Color de línea: `var(--color-hot)`
- Sin dots o con dots cuadrados (custom shape)
- Tooltip con cantidad

### Tabla: ranking de servicios
| Columna | Descripción |
|---|---|
| # | Posición |
| Servicio | Nombre |
| Citas | Total confirmadas/completadas |
| Ingreso total | Suma de precios |

### Tabla: distribución por canal
| Canal | Citas | % |
|---|---|---|
| Asistente IA | n | x% |
| Formulario | n | x% |

---

## 6. Arquitectura técnica

### Archivos

| Archivo | Acción |
|---|---|
| `app/admin/page.tsx` | Agrega query de clientes; pasa datos a `AdminDashboard` |
| `components/admin/AdminDashboard.tsx` | **Nuevo** — maneja estado de pestaña activa |
| `components/admin/AdminCitas.tsx` | Agrega stat "Ingresos hoy" |
| `components/admin/tabs/FinancieraTab.tsx` | **Nuevo** — tab financiera completa |
| `components/admin/tabs/OperativaTab.tsx` | **Nuevo** — tab operativa completa |

### Flujo de datos
1. `page.tsx` (Server Component) ejecuta dos queries:
   - Citas con joins a `clientes` y `servicios` (ya existente, sin cambios)
   - Clientes: `select id, created_at` (nueva, mínima)
2. Ambos arrays se pasan como props a `AdminDashboard`
3. `AdminDashboard` renderiza las tres pestañas pasando los datos
4. Cálculos financieros y operativos: `useMemo` en cada tab component
5. El selector mes/año es `useState` local en `FinancieraTab`

### Dependencia nueva
```bash
npm install recharts
```

Recharts se usa exclusivamente para `BarChart` (Financiera) y `LineChart` (Operativa). Los colores se pasan como strings CSS (`var(--color-acid)`, etc.) directamente en las props del gráfico.

---

## 7. Estética

- Bordes: `2px solid var(--color-ink)` — sin `rounded`
- Cards: fondo blanco o `var(--color-paper)`
- Tipografía: `font-serif` para números grandes, `text-xs uppercase tracking-wider` para labels
- Sin sombras, sin gradientes
- Colores de acento: `--color-acid` (amarillo) para positivo, `--color-hot` (rojo) para alertas/cancelaciones

---

## 8. Fuera de alcance

- Exportación a CSV/Excel
- Gráficos de torta/donut
- Comparativas entre períodos
- Predicciones o proyecciones
- Filtros en la tab Operativa
