import * as React from 'react';
import { cn } from '@/lib/utils';

export type LogoVariant = 'stacked' | 'lockup' | 'compact' | 'header' | 'icon';

interface LogoProps {
  className?: string;
  alt?: string;
  /** Fondo oscuro: tinta clara derivada del arte original. */
  onDark?: boolean;
  /**
   * `header`: isotipo + "ZAVADIVKER" en tinta plana y "MOTOS" en naranja.
   * `lockup`: isotipo + wordmark en una línea. `compact`: sólo wordmark.
   * `stacked`: composición original. `icon`: isotipo para espacios mínimos.
   */
  variant?: LogoVariant;
  /** @deprecated Usar `variant="icon"`. */
  icon?: boolean;
}

const ASSETS: Record<LogoVariant, { light: string; dark: string; width: number; height: number }> = {
  stacked: {
    light: '/logo/zavadivker-light.png',
    dark: '/logo/zavadivker-dark.png',
    width: 1084,
    height: 928,
  },
  lockup: {
    light: '/logo/zavadivker-lockup-light.png',
    dark: '/logo/zavadivker-lockup-dark.png',
    width: 1144,
    height: 155,
  },
  compact: {
    light: '/logo/zavadivker-compact-light.png',
    dark: '/logo/zavadivker-compact-dark.png',
    width: 922,
    height: 155,
  },
  header: {
    light: '/logo/zavadivker-header-light.png',
    dark: '/logo/zavadivker-header-dark.png',
    width: 1144,
    height: 155,
  },
  icon: {
    light: '/logo/zavadivker-icon-light.png',
    dark: '/logo/zavadivker-icon-dark.png',
    width: 512,
    height: 512,
  },
};

/**
 * Logo oficial de ZAVADIVKER MOTOS. Las variantes se derivan del JPEG original
 * (sin redibujar trazos) y se recomponen para que el texto sea legible en
 * cualquier superficie, sin recuadros ni fondos que lo separen de la página.
 */
export const Logo: React.FC<LogoProps> = ({
  className,
  alt = 'ZAVADIVKER MOTOS',
  onDark = false,
  variant = 'lockup',
  icon = false,
}) => {
  const selected: LogoVariant = icon ? 'icon' : variant;
  const asset = ASSETS[selected];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center leading-none',
        className,
      )}
    >
      <img
        src={onDark ? asset.dark : asset.light}
        alt={alt}
        width={asset.width}
        height={asset.height}
        className="block h-full w-auto max-w-full object-contain"
        draggable={false}
      />
    </span>
  );
};
