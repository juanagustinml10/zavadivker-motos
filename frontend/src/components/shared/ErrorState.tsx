import * as React from 'react';
import { CircleAlert, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Estado de error honesto: la API puede no responder y nunca debemos
 * transformar ese fallo en "no hay resultados" ni en datos inventados.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'No pudimos cargar la información',
  message = 'No pudimos conectarnos con el servidor en este momento. Intentá de nuevo en unos instantes.',
  onRetry,
  compact = false,
  tone = 'dark',
  className,
}) => {
  const light = tone === 'light';
  return (
    <div
      role="alert"
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden border-y text-center',
        light ? 'border-black/10 bg-zv-paper text-zv-black' : 'border-zv-line bg-zv-panel text-zv-white',
        compact ? 'gap-3 px-5 py-9' : 'gap-4 px-6 py-16',
        className
      )}
    >
      <div className="track-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <span className="race-rule relative" aria-hidden="true" />
      <CircleAlert
        size={compact ? 26 : 36}
        className={cn('relative shrink-0 text-zv-orange', !light && 'text-zv-orange-soft')}
        aria-hidden="true"
      />
      <div className="relative">
        <p className={cn('font-display font-black uppercase leading-tight tracking-[-0.03em]', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl', light ? 'text-zv-black' : 'text-white')}>
          {title}
        </p>
        <p className={cn('mx-auto mt-2 max-w-md text-sm leading-relaxed', light ? 'text-black/60' : 'text-zv-ink-400')}>{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn('btn relative mt-2 px-6', light ? 'btn-orange' : 'btn-ghost')}
        >
          <RefreshCw size={15} />
          Reintentar
        </button>
      )}
    </div>
  );
};
