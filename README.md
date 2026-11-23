# ZAVADIVKER MOTOS — Plataforma web

Sitio público y panel administrativo de **ZAVADIVKER MOTOS**, concesionaria
multimarca especializada en motos de **enduro, motocross y off-road**.

Catálogo de motocicletas 0 km y usadas, fichas individuales con galería de
fotos, filtros por condición/marca/uso, comparador, favoritos, consultas por
WhatsApp y gestión privada de publicaciones e imágenes.

> Datos oficiales centralizados en `frontend/src/lib/constants.ts`: WhatsApp
> **3814057359** (`wa.me/5493814057359`). La dirección es provisoria
> heredada de la instalación anterior (**9 de Julio 119, Juan B. Alberdi,
> Tucumán**) y queda pendiente de confirmación con el cliente. No se inventan
> garantías, cuotas, tasas, envíos ni promociones.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + Vite 8 + TypeScript, Tailwind CSS v4, Zustand, Axios, React Router 7, Lucide |
| Backend | Node.js ≥ 18 + Express 4 + TypeScript (runtime con `tsx`) |
| ORM / DB | Prisma 6 + PostgreSQL (Neon recomendado) |
| Autenticación | JWT access + refresh con sesiones en DB y contraseñas hasheadas con bcryptjs |
| Validación | Zod |
| Imágenes | Multer + Sharp → WebP full/miniatura; `local` en desarrollo, `db` (BYTEA) en producción |

## Identidad visual

Sistema propio ZV: negro `#07080A`, naranja `#F45B21` (del logo oficial) y
blanco roto `#F6F5F2`; tipografías **Archivo** (display) y **Space Grotesk**
(cuerpo). Fotografía protagonista, composiciones editoriales, animación de
entrada suave y acentos naranjas puntuales. El logo oficial se procesa desde
`logo zavadivker.jpeg` sin redibujarlo: se separan el isotipo, el wordmark y el
bloque naranja para generar variantes transparentes para fondos claros y
oscuros. Hay cuatro composiciones —apilada, `lockup` (horizontal), `compact`
(sólo wordmark) y `header` (`ZAVADIVKER` en tinta plana y `MOTOS` en naranja
para la navbar)— más isotipo, favicon con la `Z` original e imagen Open Graph. El
componente `Logo` elige la composición y el contraste según la superficie; el
hero no muestra logo, sólo la barra de navegación.

## Estructura

```text
.
├── frontend/                 # SPA pública + panel admin
│   ├── public/logo/          # logo apilado, lockups, compact, isotipos y OG
│   └── src/
│       ├── components/       # ui/, shared/, public/, admin/
│       ├── pages/            # public/, admin/
│       ├── layout/           # PublicLayout, Navbar, Footer, admin/AdminLayout
│       ├── services/         # clientes API (bikes, auth, stats)
│       ├── stores/           # favoritos y comparador (localStorage)
│       └── lib/constants.ts  # datos oficiales de ZAVADIVKER MOTOS
├── backend/                  # API REST
│   ├── src/                  # app, config, middleware, routes, controllers, services
│   ├── prisma/               # schema, migrations, seed
│   └── .env.example
├── scripts/dev.mjs           # levanta backend + frontend juntos
├── tools/                    # generación de assets del logo y las fotos editoriales
└── vercel.json               # configuración de servicios/rewrites
```

## Puesta en marcha

```bash
npm install
npm run dev
# backend: http://localhost:4000 · frontend: http://localhost:5173
```

Si preferís hacerlo por separado:

```bash
cd backend
cp .env.example .env
# Editá .env con tu propia PostgreSQL y secretos nuevos
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev

cd ../frontend
cp .env.example .env
npm install
npm run dev
```

> En Windows con este harness, si hace falta lanzar manualmente:
> `node node_modules/tsx/dist/cli.mjs watch src/index.ts` en `backend` y
> `node node_modules/vite/bin/vite.js` en `frontend`.

### Regenerar assets del logo y las fotografías

```bash
py -3 tools/zavadivker-logo-assets.py
node tools/zavadivker-image-assets.mjs
```

El script de fotografías descarga imágenes reales de motocicletas publicadas
en Unsplash vía Wikimedia Commons bajo CC0 1.0 y genera los WebP editoriales.
No se reutilizó ninguna foto del proyecto SF MOTOS. Créditos y enlaces a las
fuentes originales: `IMAGE_CREDITS.md`.

## Compilación y chequeos

```bash
npm run build
cd frontend && npx tsc --noEmit -p tsconfig.app.json
cd frontend && npm run lint
cd backend && npx tsc --noEmit
```

Si `prisma generate` falla con `EPERM` en Windows, detené el dev server del
backend: el query engine queda bloqueado.

## Endpoints principales

- `GET /health`
- `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- `GET /api/bikes` con filtros `q`, `brand`, `model`, `year`, `condition`, `usage`, `priceMin`, `priceMax`, `status`, `featured`, `page`, `limit`
- `GET /api/bikes/slug/:slug`, `GET /api/bikes/:id`, `GET /api/bikes/brands`
- `POST /api/bikes`, `PATCH /api/bikes/:id`, `DELETE /api/bikes/:id` (auth)
- `POST /api/bikes/:id/images`, `PATCH /api/bikes/:id/images/order`, `PATCH /api/bikes/:id/images/:imageId/primary`, `DELETE /api/bikes/:id/images/:imageId` (auth)
- `POST /api/bikes/:id/visits` (público)
- `GET /api/images/:key?variant=thumb`
- `GET /api/stats/dashboard`, `GET /api/stats/recent-bikes` (auth)

## Variables de entorno

Ver `backend/.env.example` y `frontend/.env.example`. Nunca commitear `.env`.

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Cadenas pooled y directa de tu propia Neon/Postgres |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secretos aleatorios nuevos y distintos |
| `PUBLIC_BASE_URL` | URL HTTPS pública de la API, necesaria con `STORAGE_DRIVER=db` |
| `CORS_ORIGIN` | Orígenes permitidos del frontend ZAVADIVKER |
| `STORAGE_DRIVER` | `local` (desarrollo) o `db` (producción) |
| `VITE_API_BASE_URL` | URL del backend propio (variable de build del frontend) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credenciales iniciales del admin |

## Estado actual

- Rediseño visual integral implementado en código; funcionalidad completa conservada.
- **Sin base de datos propia configurada**: con `backend/.env` placeholder, el
  sitio público muestra estados vacíos. Eso es un estado de datos, no un error de API.
- El frontend **no apunta al backend de SF MOTOS**: en producción hay que definir
  `VITE_API_BASE_URL` con el backend nuevo.
- Repositorio, base de datos y despliegue propios: pendientes. Ver `DEPLOYMENT.md`.
- Las claves `localStorage` (`sf_motos_*`) se conservan por compatibilidad de
  sesión/favoritos/comparador; son internas, no texto visible.

## Aclaraciones

- No hay publicaciones ficticias: el catálogo arranca vacío y se carga desde el panel.
- Las imágenes sin foto muestran "Foto no disponible".
- Favoritos y comparador persisten solo en `localStorage` del navegador.
- No se implementó calculadora de financiación ni de permuta.
