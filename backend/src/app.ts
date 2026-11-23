import express, { type NextFunction, type Request, type Response } from 'express';
import * as helmetModule from 'helmet';
import type { HelmetOptions } from 'helmet';
import cors, { type CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import { env, isProduction } from './config/env.js';
import prisma from './lib/prisma.js';
import { errorHandler } from './middleware/error.js';
import router from './routes/index.js';

const app = express();

/**
 * Helmet 8 publica el middleware como `default`, pero según cómo el compilador
 * resuelva ESM/CJS ese default puede verse como el namespace del módulo. Extraer
 * el callable explícitamente evita el TS2349 en Vercel sin desactivar Helmet.
 */
type HelmetMiddleware = (
  options?: Readonly<HelmetOptions>,
) => (req: Request, res: Response, next: NextFunction) => void;
const helmetNamespace = helmetModule as unknown as HelmetMiddleware & {
  default?: HelmetMiddleware;
};
const helmet = helmetNamespace.default ?? helmetNamespace;

// Las fotos se sirven desde otro origen (Cloudflare Pages / vite en dev).
// CORP "same-origin" de Helmet las bloquearía en el <img>; los uploads son públicos.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Health checks y clientes sin header Origin (curl, Vercel) pasan sin eco.
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((allowed) => {
      if (!allowed.includes('*')) return allowed === origin;
      const escaped = allowed
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp(`^${escaped}$`).test(origin);
    });

    if (isAllowed) return callback(null, origin);
    // Sin cabecera ACAO: el navegador bloquea la respuesta, sin 500 en el API.
    return callback(null, false);
  },
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: 'zavadivkermotos-backend', db: 'ok' });
  } catch {
    res.status(503).json({ ok: false, service: 'zavadivkermotos-backend', db: 'unavailable' });
  }
});

// En Vercel no hay disco persistente: las fotos se sirven desde Neon (db) o S3.
if (env.STORAGE_DRIVER === 'local') {
  if (isProduction) {
    console.warn(
      '[warn] STORAGE_DRIVER=local en producción: Vercel no conserva el disco y express.static() no sirve archivos. ' +
        'Configurá STORAGE_DRIVER=db (imágenes en Neon) o STORAGE_DRIVER=s3 con sus variables para habilitar las subidas.',
    );
  }
  app.use('/uploads', express.static(env.UPLOAD_DIR));
}

app.use('/api', router);

app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada', statusCode: 404 });
});

app.use(errorHandler);

export default app;
