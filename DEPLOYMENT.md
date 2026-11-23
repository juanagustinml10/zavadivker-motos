# ZAVADIVKER MOTOS — Guía de despliegue

> Este documento **no contiene secretos**. La instalación anterior (SF MOTOS)
> sigue siendo propiedad de su titular: no reutilizar su repositorio, base de
> datos, URLs, secretos ni credenciales. Este proyecto es una instalación
> comercial independiente.

## 1. Arquitectura actual (en producción)

| Capa | Servicio | URL / proyecto |
| --- | --- | --- |
| Repositorio | GitHub público | `juanagustinml10/zavadivker-motos` (rama `main`) |
| Frontend | Vercel (Vite, root directory `frontend`) | https://zavadivker-frontend.vercel.app |
| Backend | Vercel (Express, root directory `backend`) | https://zavadivker-motos.vercel.app |
| Base de datos | Neon PostgreSQL, proyecto `zavadivker-motos`, branch `production` | Región `aws-sa-east-1` |

Ambos proyectos de Vercel están conectados al mismo repositorio: un push a
`main` dispara un deploy automático del servicio correspondiente. El frontend
usa `VITE_API_BASE_URL=https://zavadivker-motos.vercel.app` y el backend
autoriza ese origen con `CORS_ORIGIN`. Las fotos se guardan en Neon
(`STORAGE_DRIVER=db`), sin disco ni bucket.

## 2. Variables de entorno

Configuradas como Secret/Config en cada proyecto de Vercel, nunca versionadas.

Backend (`zavadivker-motos`, Production):

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | Cadena **pooled** (`-pooler`) de Neon |
| `DATABASE_URL_UNPOOLED` | Cadena directa de Neon (la que usan las migraciones) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secretos aleatorios nuevos, distintos |
| `CORS_ORIGIN` | `https://zavadivker-frontend.vercel.app` |
| `PUBLIC_BASE_URL` | `https://zavadivker-motos.vercel.app` |
| `STORAGE_DRIVER` | `db` |

Frontend (`zavadivker-frontend`, Production): `VITE_API_BASE_URL`.

Para rotar secretos o cambiar orígenes:

```bash
vercel env add NOMBRE --environment production --project zavadivker-motos --force
vercel env add VITE_API_BASE_URL --environment production --project zavadivker-frontend --force
```

## 3. Base de datos

Migraciones versionadas en `backend/prisma/migrations`, **ya aplicadas** en la
branch `production`:

- `20261116000000_init`
- `20261117000000_add_usage_hours_draft`
- `20261119000000_add_image_blobs`
- `20261121000000_optimize_images`
- `20261121010000_add_bike_usage`

En una base nueva, una sola vez y con la cadena directa:

```bash
cd backend
npx prisma migrate deploy
```

También están cargadas las 9 marcas que figuran en la home (KTM, HUSQVARNA,
GASGAS, BETA, SHERCO, HONDA, YAMAHA, KAWASAKI y SUZUKI). No hay endpoint para
crear marcas: se cargan por SQL o Prisma.

## 4. Usuario administrador

No hay registro público de administradores. Se creó uno con el seed de Prisma:

- Email: `admin@zavadivker.com`
- Password: valor aleatorio entregado fuera del repositorio (guardarlo en un
  gestor de contraseñas; no está en `.env`, git ni este documento).

Si hay que recrearlo en otra base:

```bash
SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npm run prisma:seed
```

El seed es idempotente: omite la creación si el email ya existe. Panel:
https://zavadivker-frontend.vercel.app/admin

## 5. Verificación posterior al deploy

```text
GET  https://zavadivker-motos.vercel.app/health           -> 200 {"ok":true,"service":"zavadivkermotos-backend","db":"ok"}
GET  https://zavadivker-motos.vercel.app/api/bikes        -> 200 {"data":[],"meta":{...}}
GET  https://zavadivker-motos.vercel.app/api/bikes/brands -> 200 con las 9 marcas
POST https://zavadivker-motos.vercel.app/api/auth/login   -> 200 con accessToken
GET  https://zavadivker-frontend.vercel.app               -> 200 SPA de ZAVADIVKER MOTOS
GET  https://zavadivker-frontend.vercel.app/admin/login   -> 200 SPA (rewrite a index.html)
```

El catálogo público está vacío a propósito: no se publicaron motos de prueba.

## 6. Seguridad y operación

- `.env`, `.env.*` ignorados; solo `.env.example` versionados.
- JWT access + refresh con rotación y filas en `Session`. Tokens en
  `localStorage`: migrar a cookies `HttpOnly`/`Secure` es una mejora pendiente.
- No hay rate limiting en `/api/auth/login`: recomendable antes de exponer más
  el panel.
- No reintroducir el endpoint temporal `/__sql` ni su variable `MIGRATE_KEY`.
- El directorio local `.vercel` con el proyecto de SF MOTOS se quitó para
  evitar deploys accidentales; usar siempre `--project <nombre>`.
