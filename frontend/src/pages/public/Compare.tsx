import * as React from 'react';
import { useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Scale, MessageCircle } from 'lucide-react';
import { Link } from '@/components/shared/Link';
import { PageIntro } from '@/components/public/PageIntro';
import { EmptyState } from '@/components/shared/EmptyState';
import { ImagePlaceholder } from '@/components/shared/ImagePlaceholder';
import { ConditionTag } from '@/components/public/BikeBadges';
import { buildWhatsAppLink } from '@/lib/constants';
import { getThumbnailUrl } from '@/lib/images';
import { conditionLabel, formatDisplacement, formatMileage, formatPrice, statusLabel, usageLabel } from '@/lib/format';
import { useCompareStore } from '@/stores/compare';
import type { Bike } from '@/types';
import { cn } from '@/lib/utils';

type AttrKey = 'brand' | 'model' | 'year' | 'condition' | 'usage' | 'displacementCc' | 'mileageKm' | 'price' | 'status';

const ATTRS: Array<{ key: AttrKey; label: string }> = [
  { key: 'brand', label: 'Marca' },
  { key: 'model', label: 'Modelo' },
  { key: 'year', label: 'Año' },
  { key: 'condition', label: 'Categoría' },
  { key: 'usage', label: 'Uso' },
  { key: 'displacementCc', label: 'Cilindrada' },
  { key: 'mileageKm', label: 'Kilometraje' },
  { key: 'price', label: 'Precio' },
  { key: 'status', label: 'Disponibilidad' },
];

const renderValue = (bike: Bike, key: AttrKey): string => {
  switch (key) {
    case 'price': return formatPrice(bike.price, bike.currency);
    case 'condition': return conditionLabel(bike.condition);
    case 'usage': return usageLabel(bike.usage);
    case 'brand': return bike.brand?.name ?? '—';
    case 'displacementCc': return formatDisplacement(bike.displacementCc);
    case 'mileageKm': return formatMileage(bike.mileageKm);
    case 'status': return statusLabel(bike.status);
    default: return String(bike[key] ?? '—');
  }
};

export const Compare: React.FC = () => {
  const bikes = useCompareStore((state) => state.bikes);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);

  const whatsappLink = useCallback(() => {
    const detalle = bikes
      .map((bike) => `${bike.title} (${bike.year}) — ${formatPrice(bike.price, bike.currency)}`)
      .join('\n');
    return buildWhatsAppLink(`Hola ZAVADIVKER MOTOS! Me interesan estas motos:\n${detalle}`);
  }, [bikes]);

  if (bikes.length === 0) {
    return (
      <div className="container-zv flex min-h-[75vh] items-center py-12 sm:py-16">
        <EmptyState
          icon={<Scale size={30} />}
          code="00"
          title={<>Comparador <span className="text-zv-orange">vacío</span></>}
          description="Agregá hasta dos motos desde el catálogo y compará año, cilindrada, kilometraje y precio lado a lado."
          actions={
            <Link to="/motos" className="btn btn-orange px-7 py-4 text-xs">
              Ir al catálogo <ChevronRight size={16} />
            </Link>
          }
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zv-black pb-[calc(5rem+env(safe-area-inset-bottom))] text-zv-white sm:pb-20">
      {/* Encabezado */}
      <PageIntro
        index="01"
        eyebrow="Decisión informada"
        title={<>Comparador<span className="text-zv-orange">.</span></>}
        outline="VS"
        description={
          <p>
            {bikes.length} de 2 motos seleccionadas. Compará sus datos principales lado a lado y consultanos
            por la unidad que te interese.
          </p>
        }
        actions={
          <button type="button" onClick={clear} className="btn btn-ghost w-full px-5 py-3 text-xs sm:w-auto">
            <X size={15} /> Limpiar selección
          </button>
        }
      />

      {/* Tabla comparativa */}
      <section className="container-zv py-12 sm:py-16">
        <div className="mb-6 flex items-center gap-4">
          <span className="race-rule" aria-hidden="true" />
          <span className="micro-label text-zv-orange-soft">Ficha comparativa</span>
        </div>

        <div className="relative hidden overflow-x-auto border-y border-zv-line bg-zv-panel sm:block">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-zv-orange" aria-hidden="true" />
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zv-line">
                <th scope="col" className="sticky left-0 z-10 bg-zv-panel px-5 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-zv-ink-500">
                  Característica
                </th>
                {bikes.map((bike) => (
                  <th key={bike.id} scope="col" className="min-w-[220px] px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-14 w-20 shrink-0 overflow-hidden border border-zv-line bg-black">
                          {bike.images?.[0] ? (
                            <img src={getThumbnailUrl(bike.images[0].url)} alt="" className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <ImagePlaceholder width={160} height={112} className="h-full w-full" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-display text-base font-bold uppercase leading-tight text-white">{bike.title}</p>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zv-orange-soft">{bike.brand?.name ?? ''}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(bike.id)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-zv-ink-400 transition-colors hover:border-zv-orange hover:bg-zv-orange/10 hover:text-white"
                        aria-label={`Quitar ${bike.title} del comparador`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ATTRS.map((attr, index) => {
                const values = bikes.map((bike) => renderValue(bike, attr.key));
                const allEqual = values.every((value) => value === values[0]);
                return (
                  <tr key={attr.label} className={cn('border-b border-zv-line last:border-0', index % 2 === 1 && 'bg-white/[0.02]')}>
                    <th scope="row" className="sticky left-0 z-10 bg-zv-panel px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-zv-ink-500">
                      {attr.label}
                    </th>
                    {values.map((value, valueIndex) => (
                      <td key={valueIndex} className="px-5 py-4">
                        <span className={cn('font-display text-base font-bold uppercase leading-tight text-white', allEqual && 'text-zv-ink-500')}>
                          {value}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* En mobile la tabla se reemplaza por tarjetas: sin scroll horizontal. */}
        <div className="border-y border-zv-line bg-zv-panel sm:hidden">
          {ATTRS.map((attr) => {
            const values = bikes.map((bike) => renderValue(bike, attr.key));
            const allEqual = values.every((value) => value === values[0]);
            return (
              <div key={attr.label} className="border-b border-zv-line px-5 py-4 last:border-0">
                <p className="micro-label text-zv-ink-500">{attr.label}</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {values.map((value, index) => (
                    <div key={index} className="min-w-0 border-l-2 border-zv-orange/60 pl-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zv-ink-500">
                        {bikes[index].brand?.name ?? `Moto ${index + 1}`}
                      </p>
                      <p className={`mt-1 break-words font-display text-sm font-bold uppercase leading-tight ${allEqual ? 'text-zv-ink-400' : 'text-white'}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 hidden text-[10px] uppercase tracking-[0.2em] text-zv-ink-600 sm:block">Deslizá horizontalmente para ver todas las columnas en pantallas chicas.</p>

        {/* Unidades comparadas */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {bikes.map((bike) => (
            <article key={bike.id} className="group relative flex flex-col border border-zv-line bg-zv-surface transition-colors hover:border-zv-orange/60 sm:flex-row">
              <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-black sm:aspect-auto sm:w-[42%]">
                {bike.images?.[0] ? (
                  <img src={getThumbnailUrl(bike.images[0].url)} alt={bike.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
                ) : (
                  <ImagePlaceholder width={640} height={400} label="Foto no disponible" className="h-full w-full" />
                )}
                <div className="absolute left-4 top-4">
                  <ConditionTag condition={bike.condition} overlay />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.25em] text-zv-orange-soft">{bike.brand?.name}</p>
                <h3 className="mt-1 font-display text-2xl font-black uppercase leading-tight tracking-[-0.03em] text-white">{bike.title}</h3>
                <p className="mt-3 font-display text-xl font-extrabold text-zv-orange">{formatPrice(bike.price, bike.currency)}</p>
                <Link to={`/motos/${bike.slug}`} className="mt-auto inline-flex items-center gap-1.5 border-b border-white/20 pb-1 pt-5 font-display text-xs font-bold uppercase tracking-[0.2em] text-zv-ink-300 transition-colors hover:border-zv-orange hover:text-white">
                  Ver ficha completa <ChevronRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="container-zv">
        <div className="relative overflow-hidden border-y border-zv-orange/30 bg-zv-panel px-6 py-10 sm:px-9 sm:py-12">
          <span className="pointer-events-none absolute -right-4 -top-12 select-none font-display text-[10rem] font-black leading-none text-outline sm:text-[14rem]" aria-hidden="true">ZM</span>
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <span className="micro-label text-zv-orange-soft">Siguiente paso</span>
              <p className="mt-4 font-display text-3xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-5xl">
                ¿Ya te <span className="text-zv-orange">decidiste?</span>
              </p>
              <p className="mt-2 text-sm text-zv-ink-400">Consultanos disponibilidad de estas motos por WhatsApp.</p>
            </div>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-orange w-full px-7 py-4 text-sm lg:w-auto">
              <MessageCircle size={18} /> Consultar por estas motos
            </a>
          </div>
        </div>
        <Link to="/motos" className="mt-8 inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-zv-ink-400 transition-colors hover:text-white">
          <ChevronLeft size={15} /> Volver al catálogo
        </Link>
      </section>
    </div>
  );
};
