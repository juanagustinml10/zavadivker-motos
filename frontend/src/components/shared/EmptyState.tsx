import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  code?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
  tone?: 'dark' | 'light';
  className?: string;
}

/** Estado vacío con la misma voz visual en catálogo, comparador y favoritos. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  code,
  title,
  description,
  actions,
  tone = 'dark',
  className,
}) => {
  const light = tone === 'light';
  return (
    <div
      className={cn(
        'relative flex min-h-[26rem] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center',
        light ? 'bg-zv-paper text-zv-black' : 'border-y border-zv-line bg-zv-panel text-zv-white',
        className
      )}
    >
      <div className="track-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      {code && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -bottom-12 right-1 select-none font-display text-[10rem] font-black leading-none sm:text-[15rem]',
            light ? 'text-outline-light opacity-70' : 'text-outline opacity-70'
          )}
        >
          {code}
        </span>
      )}
      <span className="race-rule relative" aria-hidden="true" />
      <div
        className={cn(
          'relative mt-9 flex h-14 w-14 items-center justify-center border',
          light ? 'border-zv-orange/50 text-zv-orange' : 'border-zv-orange/40 bg-zv-orange/5 text-zv-orange-soft'
        )}
      >
        {icon}
      </div>
      <h2
        className={cn(
          'relative mt-7 max-w-xl font-display text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-5xl',
          light ? 'text-zv-black' : 'text-white'
        )}
      >
        {title}
      </h2>
      <p className={cn('relative mt-4 max-w-md text-sm leading-relaxed', light ? 'text-black/60' : 'text-zv-ink-400')}>
        {description}
      </p>
      {actions && <div className="relative mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">{actions}</div>}
    </div>
  );
};
