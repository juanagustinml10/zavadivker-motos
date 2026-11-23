# ZAVADIVKER MOTOS — Guía de despliegue

> Este documento **no contiene secretos**. La instalación anterior (SF MOTOS)
> sigue siendo propiedad de su titular: no reutilizar su repositorio, base de
> datos, URLs, secretos ni credenciales. Este proyecto es una instalación
> comercial independiente.

## 1. Arquitectura objetivo

| Capa | Tecnología | Estado |
| --- | --- | --- |
| Repositorio | GitHub, repo nuevo propio | ⏳ por crear |
| Frontend | Vite/React (Cloudflare Pages o Vercel) | ⏳ por desplegar |
| Backend | Express + tsx (Vercel u otro host Node) | ⏳ por desplegar |
| Base de datos | Neon PostgreSQL propia | ⏳ por crear |

`vercel.json` de la raíz describe los servicios `backend` y `frontend` con
rewrites de `/health`, `/api/(.*)` y catch-all, útil si se despliega todo junto
en Vercel. Si se usa Cloudflare Pages para el SPA, mantener
`frontend/public/_redirects` y definir `VITE_API_BASE_URL` apuntando al backend nuevo.

## 2. Antes de publicar

1. **Repositorio**: crear un repo vacío nuevo y agregarlo como remote. El remote
   actual todavía apunta a `juanagustinml10/sf-motos`; no hacer push hasta
   reemplazarlo. No se realizaron cambios de remote en este trabajo.
2. **Base de datos**: crear un proyecto Neon nuevo. Obtener la cadena pooled
   (`-pooler`) para `DATABASE_URL` y la directa para `DATABASE_URL_UNPOOLED`.
3. **Secretos nuevos**: generar `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`
   aleatorios y distintos. No copiar los de la instalación anterior.
4. **Frontend**: `VITE_API_BASE_URL=https://<backend-nuevo>` (variable de build).
   Sin ella, el bundle usa `/api` relativo, que sólo funciona si frontend y API
   comparten dominio con rewrites.
5. **CORS**: `CORS_ORIGIN=https://<frontend-nuevo>` (y el dominio propio si aplica).
6. **Datos oficiales**: confirmar la dirección definitiva y actualizar
   `BUSINESS.address` / `BUSINESS.addressLink` en `frontend/src/lib/constants.ts`.
   El WhatsApp ya está actualizado a `54938140573359`.

## 3. Base de datos y migraciones

Migraciones versionadas en `backend/prisma/migrations` (no reiniciar el historial):

- `20261116000000_init`
- `20261117000000_add_usage_hours_draft`
- `20261119000000_add_image_blobs`
- `20261121000000_optimize_images`
- `20261121010000_add_bike_usage`

En una base nueva, una sola vez con las cadenas directas disponibles:

```bash
cd backend
npx prisma migrate deploy
```

`npm run build` ejecuta `prisma generate && tsc --noEmit`. El runtime usa `tsx`,
no compila a `dist/`.

## 4. Usuario administrador

No existe registro público de administradores. Crear el primero con el seed,
**una sola vez**, definiendo en el entorno local:

```bash
SEED_ADMIN_EMAIL=...
SEED_ADMIN_PASSWORD=...
npm run prisma:seed
```

El seed es idempotente: omite la creación si el email ya existe. Guardar las
credenciales fuera del repositorio. Panel: `https://<frontend-nuevo>/admin`.

## 5. Marcas

El formulario de publicaciones exige un `brandId` válido (cuid) de la tabla
`Brand`. No hay endpoint para crear marcas. Cargar en la base nueva las marcas
que se vayan a usar, por ejemplo:

```sql
INSERT INTO "Brand" (id, name, slug, "createdAt")
VALUES
  ('cuid-unico-1', 'KTM', 'ktm', now()),
  ('cuid-unico-2', 'HUSQVARNA', 'husqvarna', now()),
  ('cuid-unico-3', 'GASGAS', 'gasgas', now()),
  ('cuid-unico-4', 'BETA', 'beta', now()),
  ('cuid-unico-5', 'SHERCO', 'sherco', now()),
  ('cuid-unico-6', 'HONDA', 'honda', now()),
  ('cuid-unico-7', 'YAMAHA', 'yamaha', now()),
  ('cuid-unico-8', 'KAWASAKI', 'kawasaki', now()),
  ('cuid-unico-9', 'SUZUKI', 'suzuki', now())
ON CONFLICT DO NOTHING;
```

> Reemplazar los `cuid-unico-N` por IDs cuid reales. La lista de la home es
> sólo presentación; la base es la fuente de verdad del formulario.

## 6. Almacenamiento de imágenes

Con `STORAGE_DRIVER=db`, los bytes WebP se guardan en `BikeImage` (BYTEA) y se
sirven por `GET /api/images/:key?variant=thumb`. No requiere credenciales S3.
`PUBLIC_BASE_URL` debe ser HTTPS y público. Sharp genera full ≤1600 px y
miniatura ≤500 px, calidad 82; máximo 10 fotos por publicación, dedupe por
checksum y una imagen por request.

Si se despliega en Vercel, **detener el backend dev server antes de
`prisma generate`** en Windows: el query engine queda bloqueado y falla con `EPERM`.

## 7. Verificación posterior al deploy

```text
GET  https://<backend-nuevo>/health                    -> 200 {"ok":true,"service":"zavadivkermotos-backend","db":"ok"}
GET  https://<backend-nuevo>/api/bikes                 -> 200 {"data":[],"meta":{...}}
GET  https://<backend-nuevo>/api/bikes/brands          -> 200 [...]
POST https://<backend-nuevo>/api/auth/login            -> 200 { accessToken, refreshToken }
GET  https://<frontend-nuevo>                          -> 200 SPA de ZAVADIVKER MOTOS
```

Después cargar unas pocas publicaciones de prueba desde el panel y revisar en
mobile (Android e iPhone) el hero, el catálogo, los filtros por uso, la ficha,
la galería, favoritos, comparador y el WhatsApp.

## 8. Seguridad y operación

- `.env`, `.env.*` ignorados; solo `.env.example` versionados.
- JWT access + refresh con rotación y filas en `Session`. Tokens en
  `localStorage`: migrar a cookies `HttpOnly`/`Secure` es una mejora pendiente.
- No hay rate limiting en `/api/auth/login`: recomendable antes de exponer el panel.
- Rotar secretos JWT propios antes del primer deploy productivo.
- No reintroducir el endpoint temporal `/__sql` ni su variable `MIGRATE_KEY`.
