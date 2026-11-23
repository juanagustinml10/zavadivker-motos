/**
 * Tipos del dominio de ZAVADIVKER MOTOS.
 * Estos tipos reflejan el contrato de la API del backend.
 */

/** Condición de la motocicleta */
export type BikeCondition = 'NUEVA' | 'USADA';

/** Uso/disciplina de la motocicleta; null = sin definir. */
export type BikeUsage = 'ENDURO_CROSS' | 'RUTA';

/** Estado de disponibilidad de la publicación */
export type BikeStatus = 'BORRADOR' | 'DISPONIBLE' | 'RESERVADA' | 'VENDIDA';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  createdAt: string;
}

export interface BikeImage {
  id: string;
  url: string;
  /** Miniatura opcional; si no viene se deriva de `url` (ver getThumbnailUrl). */
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface BikeFeature {
  id: string;
  key: string;
  value: string;
}

export interface Bike {
  id: string;
  slug: string;
  title: string;
  brandId: string;
  brand?: Brand;
  model: string;
  year: number;
  condition: BikeCondition;
  /** null en las publicaciones anteriores al campo; se muestra como "Sin definir". */
  usage: BikeUsage | null;
  displacementCc: number | null;
  mileageKm: number | null;
  /** Horas de uso declaradas en motos usadas; null/0 significa "sin dato". */
  usageHours: number | null;
  price: number;
  currency: string;
  description: string | null;
  status: BikeStatus;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  images: BikeImage[];
  features: BikeFeature[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface WhatsAppContact {
  phone: string;
  message: string;
}
