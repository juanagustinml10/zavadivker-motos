import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageIntroProps {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  outline?: string;
  tone?: 'dark' | 'light';
  align?: 'left' | 'center';
  size?: 'default' | 'large' | 'compact';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Cabecera editorial de página: tipografía ancha, filete naranja y palabra
 * de fondo. Cada sección elige tono, tamaño y contenido extra.
 */
export const PageIntro: React.FC<PageIntroProps> = ({
  index,
  eyebrow,
  title,
  description,
  actions,
  outline,
  tone = 'dark',
  align = 'left',
  size = 'default',
  className,
  children,
}) => {
  const light = tone === 'light';
  const compact = size === 'compact';
  const large = size === 'large';

  const titleSize = compact
    ? 'text-[clamp(2.5rem,7vw,4.5rem)]'
    : large
      ? 'text-[clamp(3.6rem,10vw,8rem)]'
      : 'text-[clamp(3.2rem,9vw,7rem)]';

  // En mobile el mínimo del clamp original recortaba títulos largos como "FINANCIÓN".
  const mobileTitleSize = compact
    ? 'max-sm:text-[clamp(2rem,9vw,3.2rem)]'
    : large
      ? 'max-sm:text-[clamp(2.35rem,10vw,3.6rem)]'
      : 'max-sm:text-[clamp(2.2rem,9vw,3.2rem)]';

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden border-b',
        light ? 'border-black/10 bg-zv-paper text-zv-black' : 'border-zv-line bg-zv-black text-zv-white',
        className
      )}
    >
      <div className="track-lines pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      {!light && (
        <div className="pointer-events-none absolute -right-40 -top-52 h-[36rem] w-[36rem] rounded-full bg-zv-orange/[0.07] blur-3xl" aria-hidden="true" />
      )}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-zv-orange" aria-hidden="true" />

      {outline && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -bottom-[0.16em] right-[-0.04em] hidden select-none font-display font-black leading-none lg:block',
            compact ? 'text-[11rem] xl:text-[15rem]' : large ? 'text-[17rem] xl:text-[24rem]' : 'text-[15rem] xl:text-[21rem]',
            light ? 'text-outline-light opacity-70' : 'text-outline opacity-60'
          )}
        >
          {outline}
        </span>
      )}

      <div
        className={cn(
          'container-zv relative',
          compact ? 'py-9 sm:py-12' : large ? 'py-16 sm:py-24' : 'py-14 sm:py-20',
          align === 'center' && 'text-center'
        )}
      >
        <div className={cn('flex flex-wrap items-center gap-4', align === 'center' && 'justify-center')}>
          {index && (
            <span className={cn('font-sans font-bold tracking-[0.3em] text-zv-orange', compact ? 'text-[10px]' : 'text-xs')}>
              {index}
            </span>
          )}
          <span className="h-px w-10 bg-zv-orange/70" aria-hidden="true" />
          <span
            className={cn(
              'font-sans font-bold uppercase tracking-[0.3em]',
              compact ? 'text-[10px]' : 'text-[11px]',
              light ? 'text-black/50' : 'text-zv-ink-400'
            )}
          >
            {eyebrow}
          </span>
        </div>

        <h1
          className={cn(
            'relative mt-5 font-display font-black uppercase leading-[0.85] tracking-[-0.05em] break-words max-sm:leading-[0.92]',
            titleSize,
            mobileTitleSize,
            light ? 'text-zv-black' : 'text-white'
          )}
        >
          {title}
        </h1>

        {description && (
          <div
            className={cn(
              'relative mt-6 max-w-2xl text-sm leading-relaxed sm:text-base',
              align === 'center' && 'mx-auto',
              light ? 'text-black/60' : 'text-zv-ink-400'
            )}
          >
            {description}
          </div>
        )}

        {actions && (
          <div className={cn('relative mt-8 flex flex-col gap-3 sm:flex-row', align === 'center' && 'sm:justify-center')}>
            {actions}
          </div>
        )}

        {children}
      </div>
    </section>
  );
};
