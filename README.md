# web-saci — Panel web de SACI

**SACI — Sistema Automatizado de Control de Inventarios usando QR**.
Panel de administración Next.js 16 (App Router) + React 19 + Tailwind 4 +
shadcn/Base-UI, heredado de la plataforma de `web-sacp` (capa HTTP+JWT con
refresh robusto, menús dinámicos por IndexedDB, sockets en tiempo real, PWA)
con el dominio de inventarios.

## Funcionalidades (fase 1)

- **Login** con JWT + refresh preventivo y guard de rutas por menús.
- **Dashboard** (`/admin/bi`): KPIs de stock, entradas/salidas de hoy, alertas
  de mínimo, tendencia 14 días y comparativa de almacenes (tiempo real por sockets).
- **Productos** (`/admin/productos`): CRUD con SKU autogenerado `PRD-XXXXXX`,
  categoría, unidad y stock mínimo.
- **Movimientos** (`/admin/movimientos`): kardex paginado + registro de
  ENTRADA/SALIDA escaneando el QR (escáner USB o tipeado) y AJUSTE para jefes.
- **Stock** (`/admin/stock`): existencias derivadas + alertas de bajo mínimo.
- **Etiquetas QR** (`/admin/qr`): generación por lotes, tarjetas, PDF de
  impresión, anulación individual/masiva, refresco en vivo por socket.
- **Catálogos dinámicos** (`/admin/nomenclators`): almacenes, categorías,
  unidades, ubicaciones — sin código nuevo.
- **Administración**: usuarios, roles, funciones, menús y trazas de auditoría.

## Arranque

```bash
cp .env.example .env.local      # API_URL y NEXT_PUBLIC_API_URL del api-saci
npm ci
npm run dev                     # http://localhost:3000
```

## Producción

Dockerfile standalone + docker-compose (con ARG `API_URL`/`NEXT_PUBLIC_API_URL`
embebidas en el build) y PWA (manifest + service worker + página offline).
