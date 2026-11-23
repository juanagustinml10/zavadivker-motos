import * as React from 'react';
import { conditionLabel, statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BikeCondition, BikeStatus } from '@/types';

type Tone = 'dark' | 'light';

interface BadgeProps {
  overlay?: boolean;
  tone?: Tone;
}

const chip = 'tag !rounded-none !px-2.5 !py-1.5 !text-[9px] !font-extrabold !tracking-[0.2em]';

export const ConditionTag: React.FC<BadgeProps & { condition: BikeCondition }> = ({ condition, overlay = false, tone = 'dark' }) => {
  const nueva = condition === 'NUEVA';
  return (
    <span
      className={cn(
        chip,
        nueva
          ? '!bg-zv-orange !text-zv-black'
          : overlay || tone === 'dark'
            ? '!bg-white !text-zv-black'
            : '!bg-zv-black !text-white'
      )}
    >
      {conditionLabel(condition)}
    </span>
  );
};

export const StatusTag: React.FC<BadgeProps & { status: BikeStatus }> = ({ status, overlay = false, tone = 'dark' }) => {
  const dot =
    status === 'DISPONIBLE'
      ? 'bg-green-400'
      : status === 'RESERVADA'
        ? 'bg-amber-400'
        : status === 'BORRADOR'
          ? 'bg-zv-ink-400'
          : 'bg-zv-orange';
  return (
    <span
      className={cn(
        chip,
        overlay
          ? '!border !border-white/15 !bg-zv-black/80 !text-white backdrop-blur-sm'
          : tone === 'light'
            ? '!border !border-black/20 !text-black/70'
            : '!border !border-white/20 !text-zv-ink-300'
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0', dot)} />
      {statusLabel(status)}
    </span>
  );
};

export const FeaturedTag: React.FC<BadgeProps> = ({ overlay = false, tone = 'dark' }) => (
  <span
    className={cn(
      chip,
      overlay
        ? '!border !border-zv-orange/60 !bg-zv-black/80 !text-zv-orange-soft backdrop-blur-sm'
        : tone === 'light'
          ? '!border !border-zv-orange/50 !text-zv-orange'
          : '!border !border-zv-orange/40 !bg-zv-orange/10 !text-zv-orange-soft'
    )}
  >
    <span className="h-1.5 w-1.5 shrink-0 bg-zv-orange" />
    Destacada
  </span>
);
