import { env } from './config/env.js';
import app from './app.js';

// En Vercel la plataforma invoca la función: no se abre un puerto propio.
if (process.env.VERCEL !== '1') {
  const port = Number(env.PORT);
  app.listen(port, () => {
    console.log(`ZAVADIVKER MOTOS backend escuchando en http://localhost:${port}`);
  });
}

// Vercel detecta Express desde src/index.ts o src/app.ts con export default.
export default app;
