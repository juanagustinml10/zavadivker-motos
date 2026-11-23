import * as React from 'react';
import { Link } from '@/components/shared/Link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  actionLabel?: string;
  actionTo?: string;
  index?: string;
  tone?: 'dark' | 'light';
  size?: 'default' | 'large';
}

/** Encabezado editorial reutilizable: filete, rótulo y titular deportivo. */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  actionLabel,
  actionTo,
  index,
  tone = 'dark',
  size = 'default',
}) => {
  const light = tone === 'light';
  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-5 border-t pt-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between',
        light ? 'border-black/15' : 'border-zv-line'
      )}
    >
      <div>
        <div className="flex items-center gap-4">
          <span className="race-rule !w-6" aria-hidden="true" />
          <span className={cn('micro-label', light ? 'text-zv-orange' : 'text-zv-orange-soft')}>{eyebrow}</span>
          {index && (
            <span className={cn('text-[10px] font-bold tracking-widest', light ? 'text-black/40' : 'text-zv-ink-500')}>
              {index}
            </span>
          )}
        </div>
        <h2
          className={cn(
            'mt-4 break-words font-display font-black uppercase leading-[0.88] tracking-[-0.04em] max-sm:text-3xl',
            size === 'large' ? 'text-5xl sm:text-7xl lg:text-8xl' : 'text-4xl sm:text-6xl',
            light ? 'text-zv-black' : 'text-white'
          )}
        >
          {title}
        </h2>
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className={cn(
            'group inline-flex shrink-0 items-center gap-2 border-b pb-1 font-display text-[11px] font-bold uppercase tracking-[0.22em] transition-colors',
            light
              ? 'border-black/20 text-black/70 hover:border-zv-orange hover:text-zv-orange'
              : 'border-white/20 text-zv-ink-300 hover:border-zv-orange hover:text-white'
          )}
        >
          {actionLabel}
          <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
};
