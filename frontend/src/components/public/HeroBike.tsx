import motoCrossPhoto from '@/assets/moto-cross.webp';
import { cn } from '@/lib/utils';

interface HeroBikeProps {
  className?: string;
  /** Carga prioritaria sólo para la imagen del hero principal. */
  priority?: boolean;
}

/**
 * Fotografía editorial usada en la sección institucional.
 * Muestra una motocicleta de motocross en terreno embarrado (foto de Gabriel
 * Sanchez, CC0). No representa una unidad publicada ni disponible en el
 * catálogo de ZAVADIVKER MOTOS.
 */
export const HeroBike = ({ className, priority = false }: HeroBikeProps) => (
  <img
    src={motoCrossPhoto}
    alt="Motocicleta de motocross en acción sobre terreno embarrado"
    loading={priority ? 'eager' : 'lazy'}
    fetchPriority={priority ? 'high' : undefined}
    decoding="async"
    className={cn('block h-full w-full object-cover contrast-[1.05] brightness-[0.92]', className)}
  />
);
