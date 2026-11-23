# AGENTS.md — ZAVADIVKER MOTOS

> Proyecto derivado de SF MOTOS con **rediseño visual integral** e identidad
> propia. La funcionalidad se conservó; la estética, los textos de marca, el
> logo y la configuración de API son nuevos. SF MOTOS sigue siendo otro negocio:
> no reutilizar su repositorio, DB, URLs ni credenciales.

## Stack y disposición del repo

Monorepo simple **sin workspaces** (no hay `turborepo`/`nx`/workspaces de npm). Solo `package.json` en la raíz con scripts de conveniencia; las dependencias se instalan por carpeta.

| Carpeta | Rol | Tooling |
|---|---|---|
| `frontend/` | SPA pública + panel admin | React 19, Vite 8, TypeScript ~7.0.2, Tailwind v4 (`@theme` en `src/index.css`, **no** en `tailwind.config.js`), Zustand (persist `localStorage`), React Router 7, Axios, Lucide |
| `backend/` | API REST | Node ≥18 (probado Node 24), Express 4, TS 5.8 (typecheck only), Prisma 6, Zod, bcryptjs, JWT, Multer, Sharp, Helmet |
| `scripts/dev.mjs` | Levanta backend + frontend juntos | Spawn directo de `node_modules/vite/bin/vite.js` y `node_modules/tsx/dist/cli.mjs` con `process.execPath` y **`shell: false`** |

No hay CI, no hay Dockerfiles, no hay tests.

## Comandos que el agente debe recordar

### Levantar todo
```bash
npm run dev        # scripts/dev.mjs → backend (:4000) + frontend (:5173)
npm run dev:frontend
npm run dev:backend
```
> **Windows + harness:** `node node_modules/vite/bin/vite.js` (frontend) y `node node_modules/tsx/dist/cli.mjs watch src/index.ts` (backend). El shim `npm.cmd`/`cmd.exe` NO puede spawnearlo el harness (EINVAL/ENOENT).

### Compilar y verificar
```bash
npm run build            # frontend (tsc -b && vite build) → backend (prisma generate && tsc --noEmit)
npx tsc --noEmit -p tsconfig.app.json   # dentro de frontend/
npm run lint                             # dentro de frontend/, oxlint
npx tsc --noEmit                         # dentro de backend/
```
⚠️ `prisma generate` falla con `EPERM` al renombrar el query engine si hay un dev server/tsx watch en ejecución. **Detener el backend antes de buildbackend**. No existe `tsc` en el root.

## Identidad visual (no volver a SF)

- Colores: `--color-zv-black: #07080A`, `--color-zv-orange: #F45B21`, `--color-zv-white: #F6F5F2` y superficies `--color-zv-*`. Todo en `frontend/src/index.css` (`@theme` de Tailwind v4).
- Tipografías: **Archivo** (display, `font-display`) y **Space Grotesk** (cuerpo, `font-sans`).
- Clases base: `container-zv`, `btn`, `btn-orange`, `btn-ghost`, `eyebrow`, `panel`, `field`, `field-label`, `tag`, `reveal` (componente `Reveal`).
- **Logo oficial:** fuente original `logo zavadivker.jpeg` (raíz, intacta). Se procesa con `py -3 tools/zavadivker-logo-assets.py`: se separan isotipo, wordmark y bloque naranja sin redibujar, y se generan `zavadivker-light/dark.png` (apilado), `zavadivker-lockup-light/dark.png` (horizontal), `zavadivker-compact-light/dark.png` (sólo wordmark), `zavadivker-header-light/dark.png` (isotipo + `ZAVADIVKER` en tinta plana y `MOTOS` en naranja), isotipos, favicon (la `Z` original), apple-touch-icon e imagen OG. **No redibujar, no inventar SVG; el naranja original no se modifica.** El componente `Logo` elige composición (`stacked`/`lockup`/`compact`/`header`/`icon`) y contraste según `onDark`, sin tarjetas blancas. `header` se usa en la navbar: `ZAVADIVKER` queda totalmente blanca sobre fondo oscuro y `MOTOS` con sus líneas en naranja; el hero no lleva logo.
- Fotografías editoriales nuevas (Unsplash vía Wikimedia Commons, CC0 1.0) en `frontend/src/assets/*.webp`. Regenerar con `node tools/zavadivker-image-assets.mjs`. Créditos completos en `IMAGE_CREDITS.md`. **No reutilizar fotos de SF MOTOS.**
- El catálogo usa las fotos subidas por el admin para cada moto; no se asignan fotos editoriales a publicaciones concretas para evitar mostrar un modelo incorrecto.

## Datos oficiales (no cambiar sin confirmación)

Nombre: **ZAVADIVKER MOTOS** · Actividad: concesionaria multimarca (motos 0 km y usadas) · Especialidad: enduro, motocross y off-road.

WhatsApp/Tel: **381 405-7335 9** → `https://wa.me/54938140573359`.

Dirección: **provisoria**, heredada de la instalación anterior: `9 de Julio 119, Juan B. Alberdi, Tucumán, Argentina`. Pendiente de confirmación; está centralizada en `BUSINESS.address` / `BUSINESS.addressLink` en `frontend/src/lib/constants.ts`. **No inventar años, clientes, garantías, financiación, envíos, promociones ni especialidades no confirmadas.**

## Contratos que NO se renombran

- Claves `localStorage`: `sf_motos_access_token`, `sf_motos_refresh_token`, `sf_motos_user`, `sf_motos_favorites`, `sf_motos_compare`. Cambiarlas rompe sesión, favoritos y comparador.
- `health` devuelve `service: 'zavadivkermotos-backend'`.
- esquema Prisma, endpoints, validaciones Zod, `MAX_IMAGES_PER_BIKE=10`, `MIN/MAX_MODEL_YEAR`, `BIKE_USAGES` y reglas de borradores/visitas: sin cambios funcionales.
- Las rutas públicas van dentro de `<PublicLayout>` (Navbar + Outlet + Footer). No agregar `<Navbar>` manualmente en páginas públicas.
- `ProtectedRoute` lee `localStorage` y envuelve `AdminLayout`.

## Estado real (verificado)

- Proyecto **desplegado**: frontend y backend en Vercel, base Neon propia. El sitio público muestra estados vacíos porque no hay motos publicadas todavía; no es un error de API.
- Repositorio propio: `juanagustinml10/zavadivker-motos` (rama `main`). `origin` apunta ahí; no tiene relación con SF MOTOS.
- URLs: frontend `https://zavadivker-frontend.vercel.app`, backend `https://zavadivker-motos.vercel.app`. El frontend **no apunta al backend de SF MOTOS**: `VITE_API_BASE_URL` es la única configuración. Ver `DEPLOYMENT.md`.
- Neon: proyecto `zavadivker-motos`, branch `production`, 5 migraciones aplicadas, 9 marcas cargadas y 1 usuario administrador (`admin@zavadivker.com`, password fuera del repo).
- No hay directorio local `.vercel` vinculado: usar siempre `--project <nombre>` con la CLI de Vercel para no apuntar al proyecto viejo.

## Procesos dev huérfanos

En Windows pueden persistir procesos en 4000/5173 entre sesiones y bloquear `prisma generate`. Si hay `EPERM`, matar el tsx watch y borrar los `*.tmp` de `backend/node_modules/.prisma/client`.

## Repositorio y deploy

Repositorio, Neon, Vercel, secretos JWT, seed de admin, marcas y CORS: **listos**. Detalle en `DEPLOYMENT.md`. Formato de commits: `tipo(alcance): resumen en español`.
