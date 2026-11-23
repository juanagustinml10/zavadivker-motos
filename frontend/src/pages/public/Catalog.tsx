import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  SearchX,
} from 'lucide-react';
import { BikeCard } from '@/components/public/BikeCard';
import { PageIntro } from '@/components/public/PageIntro';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { bikesService, type BikeFilters } from '@/services/bikes';
import type { Bike, BikeCondition, BikeStatus } from '@/types';
import { cn } from '@/lib/utils';
import { BIKE_USAGES, MODEL_YEARS } from '@/lib/constants';

const CONDITIONS: { value: BikeCondition; label: string }[] = [
  { value: 'NUEVA', label: '0 km' },
  { value: 'USADA', label: 'Usada' },
];

const STATUSES: { value: BikeStatus; label: string }[] = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'RESERVADA', label: 'Reservada' },
  { value: 'VENDIDA', label: 'Vendida' },
];

type SortKey = 'relevancia' | 'precio-asc' | 'precio-desc' | 'anio-desc' | 'anio-asc' | 'marca-asc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
  { value: 'anio-desc', label: 'Año: más nuevo' },
  { value: 'anio-asc', label: 'Año: más antiguo' },
  { value: 'marca-asc', label: 'Marca A–Z' },
];

const PAGE_SIZE = 12;
const FETCH_LIMIT = 100;

const sortBikes = (items: Bike[], key: SortKey): Bike[] => {
  const sorted = [...items];
  switch (key) {
    case 'precio-asc': return sorted.sort((a, b) => a.price - b.price);
    case 'precio-desc': return sorted.sort((a, b) => b.price - a.price);
    case 'anio-desc': return sorted.sort((a, b) => b.year - a.year);
    case 'anio-asc': return sorted.sort((a, b) => a.year - b.year);
    case 'marca-asc': return sorted.sort((a, b) => (a.brand?.name ?? '').localeCompare(b.brand?.name ?? '', 'es'));
    default: return sorted; // relevancia: orden del servidor (destacadas y más recientes primero)
  }
};

const isSortKey = (value: string | null): value is SortKey =>
  SORT_OPTIONS.some((option) => option.value === value);

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [openFilters, setOpenFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // La URL es la fuente de verdad: los links del navbar y el historial funcionan
  // incluso cuando ya estamos en /motos (antes el useEffect inicial no se repetía).
  const filters = useMemo<BikeFilters>(() => {
    const value = (key: string) => searchParams.get(key) ?? undefined;
    const q = value('q');
    const brand = value('brand');
    const condition = value('condition');
    const usage = value('usage');
    const status = value('status');
    const year = Number(value('year'));
    const priceMin = Number(value('priceMin'));
    const priceMax = Number(value('priceMax'));
    return {
      ...(q ? { q } : {}),
      ...(brand ? { brand } : {}),
      ...(condition === 'NUEVA' || condition === 'USADA' ? { condition } : {}),
      ...(usage === 'ENDURO_CROSS' || usage === 'RUTA' ? { usage } : {}),
      ...(status === 'DISPONIBLE' || status === 'RESERVADA' || status === 'VENDIDA' ? { status } : {}),
      ...(value('year') && Number.isInteger(year) ? { year } : {}),
      ...(value('priceMin') && Number.isFinite(priceMin) ? { priceMin } : {}),
      ...(value('priceMax') && Number.isFinite(priceMax) ? { priceMax } : {}),
      ...(searchParams.get('featured') === 'true' ? { featured: true } : {}),
    };
  }, [searchParams]);

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const sortParam = searchParams.get('sort');
  const sort: SortKey = isSortKey(sortParam) ? sortParam : 'relevancia';

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void, resetPage = true) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      if (resetPage) next.delete('page');
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setFilter = (key: string, value?: string | number | boolean) => {
    updateParams((params) => {
      if (value === undefined || value === '' || value === false) params.delete(key);
      else params.set(key, String(value));
    });
  };

  const clearFilters = () => setSearchParams(new URLSearchParams(), { replace: true });

  const goToPage = (nextPage: number) => {
    if (nextPage === page) return;
    updateParams((params) => params.set('page', String(nextPage)), false);
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    setSearchInput(filters.q ?? '');
  }, [filters.q]);

  // Búsqueda con debounce para no disparar una request por tecla.
  useEffect(() => {
    const query = searchInput.trim();
    if (query === (filters.q ?? '')) return;
    const timer = window.setTimeout(() => setFilter('q', query || undefined), 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    bikesService
      // Traemos el conjunto filtrado completo (máx. 100) para que el orden sea global.
      .list({ ...filters, page: 1, limit: FETCH_LIMIT })
      .then(({ data }) => {
        if (cancelled) return;
        const sorted = sortBikes(Array.isArray(data) ? data : [], sort);
        const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
        if (page > pages) {
          updateParams((params) => params.set('page', String(pages)), false);
          return;
        }
        setBikes(sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
        setTotal(sorted.length);
        setTotalPages(pages);
      })
      .catch(() => {
        if (cancelled) return;
        setBikes([]);
        setTotal(0);
        setTotalPages(1);
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, page, reloadKey]);

  useEffect(() => {
    bikesService
      .listBrands()
      .then((list) => setBrands(list.map((b) => ({ id: b.id, name: b.name }))))
      .catch(() => {});
  }, []);

  const hasActiveFilters = useMemo(() => {
    const keys: Array<keyof BikeFilters> = ['q', 'brand', 'model', 'year', 'condition', 'usage', 'priceMin', 'priceMax', 'status', 'featured'];
    return keys.some((key) => filters[key] !== undefined && filters[key] !== null);
  }, [filters]);

  const renderFilterPanel = (prefix: string) => (
    <div className="relative border border-zv-line bg-zv-panel p-5 sm:p-6">
      <span className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-zv-orange" aria-hidden="true" />
      <div className="mb-6 flex items-center justify-between border-b border-zv-line pb-4">
        <span className="flex items-center gap-3 font-display text-xs font-black uppercase tracking-[0.22em] text-white">
          <SlidersHorizontal size={15} className="text-zv-orange" />
          Filtros
        </span>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="flex min-h-11 items-center gap-1 font-display text-[11px] font-bold uppercase tracking-widest text-zv-orange-soft transition-colors hover:text-white">
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-12">
        <div className="col-span-2 space-y-2 md:col-span-3">
          <label className="field-label" htmlFor={`${prefix}-marca`}>Marca</label>
          <select id={`${prefix}-marca`} value={filters.brand ?? ''} onChange={(e) => setFilter('brand', e.target.value || undefined)} className="field">
            <option value="">Todas</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="field-label" htmlFor={`${prefix}-categoria`}>Categoría</label>
          <select id={`${prefix}-categoria`} value={filters.condition ?? ''} onChange={(e) => setFilter('condition', e.target.value || undefined)} className="field">
            <option value="">Todas</option>
            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="field-label" htmlFor={`${prefix}-estado`}>Estado</label>
          <select id={`${prefix}-estado`} value={filters.status ?? ''} onChange={(e) => setFilter('status', e.target.value || undefined)} className="field">
            <option value="">Todos</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="col-span-2 space-y-2 md:col-span-3">
          <label className="field-label" htmlFor={`${prefix}-precio-min`}>Precio</label>
          <div className="grid grid-cols-2 gap-2">
            <input id={`${prefix}-precio-min`} type="number" min={0} placeholder="Desde" aria-label="Precio mínimo" value={filters.priceMin ?? ''} onChange={(e) => setFilter('priceMin', e.target.value === '' ? undefined : Number(e.target.value))} className="field" />
            <input type="number" min={0} placeholder="Hasta" aria-label="Precio máximo" value={filters.priceMax ?? ''} onChange={(e) => setFilter('priceMax', e.target.value === '' ? undefined : Number(e.target.value))} className="field" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="field-label" htmlFor={`${prefix}-anio`}>Año</label>
          <select id={`${prefix}-anio`} value={filters.year ?? ''} onChange={(e) => setFilter('year', e.target.value || undefined)} className="field">
            <option value="">Cualquiera</option>
            {MODEL_YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2 flex items-end md:col-span-12 md:w-64">
          <button
            type="button"
            onClick={() => setFilter('featured', !filters.featured)}
            aria-pressed={!!filters.featured}
            className={cn(
              'flex h-12 w-full items-center justify-center gap-2 border font-display text-xs font-extrabold uppercase tracking-[0.2em] transition-colors',
              filters.featured
                ? 'border-zv-orange bg-zv-orange text-zv-black'
                : 'border-white/15 text-zv-ink-300 hover:border-zv-orange hover:text-white'
            )}
          >
            <BadgeCheck size={16} />
            Solo destacadas
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-zv-black text-zv-white">
      <PageIntro
        index="01"
        eyebrow="Inventario ZAVADIVKER MOTOS"
        title={<>Encontrá tu <span className="text-zv-orange">próxima moto</span></>}
        outline="MOTOS"
        size="compact"
        description={
          <p aria-live="polite">
            {loading
              ? 'Buscando motos...'
              : error
                ? 'No se pudo cargar el catálogo'
                : `${total} moto${total !== 1 ? 's' : ''} disponible${total !== 1 ? 's' : ''}`}
          </p>
        }
      >
        {/* Buscador */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zv-orange" aria-hidden="true" />
            <input
              type="search"
              placeholder="Marca, modelo, año, cilindrada..."
              aria-label="Buscar motocicletas"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="field h-12 pl-11 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpenFilters(!openFilters)}
            aria-expanded={openFilters}
            aria-controls="filtros-catalogo"
            className="btn btn-ghost h-12 px-5 text-[11px] md:hidden"
          >
            <SlidersHorizontal size={18} />
            {openFilters ? 'Ocultar' : 'Filtros'}
            <ChevronDown size={15} className={cn('transition-transform duration-300', openFilters && 'rotate-180')} />
          </button>
        </div>

        {/* Panel de filtros */}
        <div id="filtros-catalogo" className="mt-4">
          <div className="hidden md:block">{renderFilterPanel('desktop')}</div>
          <div className={cn('md:hidden', openFilters ? 'block' : 'hidden')}>
            <div className="pt-1">{renderFilterPanel('movil')}</div>
          </div>
        </div>
      </PageIntro>

      {/* Resultados */}
      <section id="resultados" className="relative scroll-mt-24 bg-zv-black">
        <div className="track-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="container-zv relative py-10 sm:py-14">
          <div className="mb-8 flex flex-col gap-5 border-t border-zv-line pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="micro-label text-zv-orange-soft">Resultados</p>
              <p className="mt-3 font-display text-3xl font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-4xl">
                {error ? 'Sin conexión' : `Mostrando ${bikes.length} de ${total}`}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="ordenar" className="field-label">Ordenar por</label>
              <select
                id="ordenar"
                value={sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="field sm:min-w-[190px]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Accesos por uso: filtran el inventario por la disciplina de la moto. */}
          <div className="mb-10">
            <p className="micro-label mb-4 text-zv-ink-500">Explorá por uso</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BIKE_USAGES.map((item) => {
                const active = filters.usage === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter('usage', active ? undefined : item.value)}
                    className={cn(
                      'group relative flex min-h-[110px] flex-col items-start justify-center gap-2 border px-5 py-5 text-left transition-colors sm:min-h-[130px] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-7',
                      active
                        ? 'border-zv-orange bg-zv-orange text-zv-black'
                        : 'border-zv-line bg-zv-panel text-white hover:border-zv-orange/70'
                    )}
                  >
                    <span
                      className={cn(
                        'font-display text-2xl font-black uppercase leading-none tracking-[-0.04em] sm:text-3xl',
                        active ? 'text-zv-black' : 'text-white group-hover:text-zv-orange-soft'
                      )}
                    >
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        'flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.22em]',
                        active ? 'text-zv-black/70' : 'text-zv-ink-500 group-hover:text-zv-orange-soft'
                      )}
                    >
                      {active ? <Check size={15} /> : <ArrowRight size={15} />}
                      {active ? 'Quitar filtro' : 'Ver motos'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <ErrorState
              compact
              title="No se pudo cargar el catálogo"
              className="mx-auto max-w-2xl"
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          ) : bikes.length === 0 ? (
            <EmptyState
              icon={<SearchX size={30} />}
              code="00"
              title={<>Sin resultados</>}
              description="Ninguna moto coincide con tu búsqueda. Probá con otros filtros."
              actions={hasActiveFilters ? (
                <button type="button" onClick={clearFilters} className="btn btn-orange px-6 py-3 text-xs">
                  <X size={15} /> Limpiar filtros
                </button>
              ) : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bikes.map((bike) => <BikeCard key={bike.id} bike={bike} />)}
            </div>
          )}

          {/* Paginación */}
          {!error && !loading && totalPages > 1 && (
            <nav className="mt-12 flex flex-col items-center gap-4 border-t border-zv-line pt-8" aria-label="Paginación del catálogo">
              <p className="micro-label text-zv-ink-500">
                Página {page} de {totalPages}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Página anterior"
                  className="flex h-11 w-11 items-center justify-center border border-white/15 text-zv-ink-300 transition-colors hover:border-zv-orange hover:text-zv-orange disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => goToPage(number)}
                    aria-current={number === page ? 'page' : undefined}
                    className={cn(
                      'h-11 w-11 font-display text-sm font-extrabold transition-colors',
                      number === page
                        ? 'bg-zv-orange text-zv-black'
                        : 'border border-white/15 text-zv-ink-300 hover:border-zv-orange hover:text-zv-orange'
                    )}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Página siguiente"
                  className="flex h-11 w-11 items-center justify-center border border-white/15 text-zv-ink-300 transition-colors hover:border-zv-orange hover:text-zv-orange disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
};
