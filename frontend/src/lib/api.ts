import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponseError } from '@/lib/api-response';

// ZAVADIVKER MOTOS es una instalación independiente: nunca apuntar al backend
// de la instalación anterior. En desarrollo Vite hace proxy de /api hacia localhost:4000; en
// producción hay que definir VITE_API_BASE_URL con el backend propio (o servir
// frontend y API bajo el mismo dominio con rewrites).
// ⚠️ No apuntar al dominio de Cloudflare Pages: el catch-all `/* /index.html`
// respondería con HTML para /api/* y parecería que la API "responde".
const configuredBase = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '');
const API_BASE_URL = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Adjunta el token de acceso en cada petición
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('sf_motos_access_token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo de respuestas: renueva token automáticamente ante 401
api.interceptors.response.use(
  (response) => {
    // Un 200 con text/html casi siempre significa que la petición llegó al
    // SPA (URL de API mal configurada). Se rechaza para que cada página
    // muestre su estado de error en vez de guardar HTML como si fueran datos.
    const contentType = String(response.headers?.['content-type'] ?? '');
    if (contentType.includes('text/html')) {
      return Promise.reject(
        new ApiResponseError(
          'El servidor respondió HTML en lugar de JSON. Revisá la configuración de la API.'
        )
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('sf_motos_refresh_token');
          if (!refreshToken) {
            throw new Error('No hay token de actualización');
          }

          const { data } = await api.post<{ accessToken: string }>(
            '/auth/refresh',
            { refreshToken }
          );

          const newToken = data.accessToken;
          localStorage.setItem('sf_motos_access_token', newToken);
          processQueue(null, newToken);
          originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('sf_motos_access_token');
          localStorage.removeItem('sf_motos_refresh_token');
          window.location.href = '/admin/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (token) {
          originalRequest.headers.set('Authorization', `Bearer ${token}`);
        }
        return api(originalRequest);
      });
    }

    // Limpieza de sesión ante 401 persistente
    if (error.response?.status === 401) {
      localStorage.removeItem('sf_motos_access_token');
      localStorage.removeItem('sf_motos_refresh_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
