import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  tone?: 'dark' | 'light';
}

/** Esqueleto con la misma proporción que BikeCard, para estados de carga consistentes. */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className, tone = 'dark' }) => {
  const light = tone === 'light';
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse border', light ? 'border-black/10 bg-white' : 'border-zv-line bg-zv-surface', className)}
    >
      <div className={cn('relative aspect-[4/3]', light ? 'bg-black/[0.05]' : 'bg-white/[0.04]')}>
        <span className="absolute bottom-0 left-0 h-[3px] w-14 bg-zv-orange/70" />
      </div>
      <div className="space-y-3 p-5">
        <div className={cn('h-2 w-24', light ? 'bg-black/[0.07]' : 'bg-white/[0.07]')} />
        <div className={cn('h-6 w-3/4', light ? 'bg-black/[0.09]' : 'bg-white/[0.09]')} />
        <div className={cn('h-2.5 w-1/2', light ? 'bg-black/[0.05]' : 'bg-white/[0.05]')} />
        <div className={cn('mt-5 flex items-center justify-between border-t pt-4', light ? 'border-black/10' : 'border-zv-line')}>
          <div className={cn('h-8 w-28', light ? 'bg-black/[0.08]' : 'bg-white/[0.08]')} />
          <div className={cn('h-10 w-20', light ? 'bg-black/[0.05]' : 'bg-white/[0.05]')} />
        </div>
      </div>
    </div>
  );
};
