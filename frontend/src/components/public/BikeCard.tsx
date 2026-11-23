import * as React from 'react';
import { ArrowUpRight, Heart, MessageCircle } from 'lucide-react';
import { Link } from '@/components/shared/Link';
import { ImagePlaceholder } from '@/components/shared/ImagePlaceholder';
import { useFavoritesStore } from '@/stores/favorites';
import { cn } from '@/lib/utils';
import { BUSINESS, buildBikeWhatsAppLink } from '@/lib/constants';
import { formatDisplacement, formatMileage, formatPrice } from '@/lib/format';
import { getThumbnailUrl } from '@/lib/images';
import { ConditionTag, FeaturedTag, StatusTag } from '@/components/public/BikeBadges';
import type { Bike } from '@/types';

interface BikeCardProps {
  bike: Bike;
  className?: string;
  tone?: 'dark' | 'light';
  feature?: boolean;
}

export const BikeCard: React.FC<BikeCardProps> = ({ bike, className, tone = 'dark', feature = false }) => {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(bike.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const images = bike.images ?? [];
  const primaryImage = images.find((img) => img.isPrimary) ?? images[0];
  const whatsappLink = buildBikeWhatsAppLink(bike);
  const light = tone === 'light';

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-lg border transition-all duration-300',
        light
          ? 'border-black/10 bg-white text-zv-black hover:border-zv-orange'
          : 'border-white/10 bg-zv-surface text-white hover:border-zv-orange/70',
        'hover:shadow-[0_24px_60px_-34px_rgba(0,0,0,0.9)]',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden bg-black', feature ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-[4/3]')}>
        {primaryImage ? (
          <img
            src={getThumbnailUrl(primaryImage.url)}
            alt={`${bike.brand?.name ?? ''} ${bike.model || bike.title}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <ImagePlaceholder width={800} height={600} label="Foto no disponible" className="h-full w-full" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-16 bg-zv-orange" aria-hidden="true" />

        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <ConditionTag condition={bike.condition} overlay />
          {bike.featured && <FeaturedTag overlay />}
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(bike.id)}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-zv-black/70 text-white backdrop-blur-sm transition-colors hover:border-zv-orange hover:bg-zv-orange"
        >
          <Heart size={18} className={isFavorite ? 'fill-white stroke-white' : ''} strokeWidth={2} />
        </button>

        <div className="absolute bottom-4 left-4">
          <StatusTag status={bike.status} overlay />
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col p-5', feature && 'sm:p-7')}>
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 break-words text-[10px] font-bold uppercase tracking-[0.28em] text-zv-orange">
            {bike.brand?.name ?? BUSINESS.name}
          </p>
          <span className="text-[10px] font-bold tracking-[0.2em] text-zv-ink-500">
            {bike.year}
          </span>
        </div>
        <Link to={`/motos/${bike.slug}`} className="mt-2 block">
          <h3 className={cn(
            'font-display font-extrabold uppercase leading-[0.95] tracking-tight line-clamp-2 transition-colors group-hover:text-zv-orange-soft',
            feature ? 'text-3xl sm:text-4xl' : 'text-2xl',
          )}>
            {bike.model || bike.title}
          </h3>
        </Link>
        <p className={cn('mt-2 text-xs', light ? 'text-black/55' : 'text-zv-ink-400')}>
          {formatDisplacement(bike.displacementCc)} · {formatMileage(bike.mileageKm)}
        </p>

        <div className={cn('mt-auto flex items-end justify-between gap-3 border-t pt-4', light ? 'border-black/10' : 'border-white/10')}>
          <div>
            <p className={cn('text-[9px] font-bold uppercase tracking-[0.25em]', light ? 'text-black/45' : 'text-zv-ink-500')}>
              Precio publicado
            </p>
            <p className="mt-1 break-words font-display text-xl font-extrabold leading-tight text-zv-orange sm:text-3xl sm:leading-none">
              {formatPrice(bike.price, bike.currency)}
            </p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Consultar por WhatsApp"
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors',
              light
                ? 'border-black/15 text-black/60 hover:border-zv-orange hover:bg-zv-orange hover:text-white'
                : 'border-white/15 text-zv-ink-300 hover:border-zv-orange hover:bg-zv-orange hover:text-zv-black',
            )}
          >
            <MessageCircle size={18} />
          </a>
        </div>

        <Link
          to={`/motos/${bike.slug}`}
          className={`mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zv-orange-soft transition-colors ${light ? 'hover:text-zv-black' : 'hover:text-white'}`}
        >
          Ver ficha <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
};
