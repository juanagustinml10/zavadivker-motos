import { useCallback, useEffect, useState } from 'react';
import {
  Edit2,
  ImageOff,
  Motorbike,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Link } from '@/components/shared/Link';
import { bikesService } from '@/services/bikes';
import { getThumbnailUrl } from '@/lib/images';
import type { Bike, BikeStatus } from '@/types';

const STATUS_LABELS: Record<BikeStatus, string> = {
  BORRADOR: 'Borrador',
  DISPONIBLE: 'Disponible',
  RESERVADA: 'Reservada',
  VENDIDA: 'Vendida',
};

const statusBadgeClass = (status: BikeStatus) => {
  if (status === 'BORRADOR') return 'border-white/20 bg-white/5 text-zv-ink-300';
  if (status === 'DISPONIBLE') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  if (status === 'RESERVADA') return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
  return 'border-zv-orange/40 bg-zv-orange/10 text-zv-orange-soft';
};

const getThumb = (bike: Bike) =>
  bike.images?.find((image) => image.isPrimary)?.url ?? bike.images?.[0]?.url;

export const Bikes = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BikeStatus | 'TODOS'>('TODOS');
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bikeToDelete, setBikeToDelete] = useState<Bike | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await bikesService.listAdmin({
        limit: 100,
        status: statusFilter === 'TODOS' ? undefined : statusFilter,
      });
      setBikes(response.data);
    } catch {
      setBikes([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- carga inicial del listado desde la API
    void load();
  }, [load]);

  /** Cambia el estado de una publicación con actualización optimista. */
  const changeStatus = async (bike: Bike, status: BikeStatus) => {
    if (status === bike.status || updatingStatusId) return;
    const previous = bike.status;
    setStatusError(null);
    setUpdatingStatusId(bike.id);
    setBikes((prev) =>
      prev.map((item) => (item.id === bike.id ? { ...item, status } : item)),
    );
    try {
      await bikesService.update(bike.id, { status });
    } catch {
      setBikes((prev) =>
        prev.map((item) => (item.id === bike.id ? { ...item, status: previous } : item)),
      );
      setStatusError('No se pudo cambiar el estado. Intentá de nuevo.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!bikeToDelete) return;
    setDeletingId(bikeToDelete.id);
    try {
      await bikesService.remove(bikeToDelete.id);
      setBikeToDelete(null);
      setLoading(true);
      void load();
    } catch {
      // El modal permanece abierto para que el usuario pueda reintentar.
    } finally {
      setDeletingId(null);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = bikes.filter((bike) => {
    if (statusFilter !== 'TODOS' && bike.status !== statusFilter) return false;
    if (!normalizedQuery) return true;
    const haystack = [bike.title, bike.model, bike.brand?.name ?? '', String(bike.year)]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return (
    <div className="pb-4">
      <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">Inventario / Panel ZV</span>
          <h1 className="mt-5 break-words font-display text-[clamp(2.1rem,6vw,4.6rem)] font-black uppercase leading-[0.86] tracking-[-0.055em] text-white sm:text-[clamp(2.6rem,6vw,4.6rem)]">
            Motocicletas<span className="text-zv-orange">.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zv-ink-400">
            Administración de publicaciones del catálogo.
          </p>
        </div>
        <Link
          to="/admin/motos/nuevo"
          className="btn btn-orange self-start px-6 py-4 sm:self-auto"
        >
          <Plus size={17} /> Nueva publicación
        </Link>
      </header>

      <section className="border border-white/10 bg-zv-panel">
        <div className="border-b border-white/10 p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
            <div>
              <label htmlFor="bike-search" className="field-label mb-2 block">
                Buscar
              </label>
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zv-ink-500"
                />
                <input
                  id="bike-search"
                  type="search"
                  placeholder="Marca, modelo o título…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Buscar publicaciones"
                  className="field h-12 rounded-none border-white/10 bg-zv-black pl-11 pr-4 placeholder:text-zv-ink-600"
                />
              </div>
            </div>
            <div>
              <label htmlFor="bike-status-filter" className="field-label mb-2 block">
                Estado
              </label>
              <select
                id="bike-status-filter"
                value={statusFilter}
                onChange={(event) => {
                  setLoading(true);
                  setStatusFilter(event.target.value as BikeStatus | 'TODOS');
                }}
                aria-label="Filtrar por estado"
                className="field h-12 rounded-none border-white/10 bg-zv-black px-4"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="BORRADOR">Borradores</option>
                <option value="DISPONIBLE">Disponibles</option>
                <option value="RESERVADA">Reservadas</option>
                <option value="VENDIDA">Vendidas</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zv-ink-500">
            <Motorbike size={14} className="text-zv-orange" />
            {filtered.length} publicación{filtered.length !== 1 ? 'es' : ''}
          </div>
          {statusError && (
            <p className="mt-2 text-xs text-zv-orange-soft" role="alert">
              {statusError}
            </p>
          )}
        </div>

        {/* Vista móvil: una unidad por fila, acciones grandes. */}
        <div className="divide-y divide-white/10 md:hidden">
          {loading ? (
            <p className="py-14 text-center text-sm text-zv-ink-500">
              Cargando publicaciones…
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-14 text-center text-sm text-zv-ink-500">
              No se encontraron publicaciones.
            </p>
          ) : (
            filtered.map((bike) => {
              const thumb = getThumb(bike);
              return (
                <div key={bike.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-zv-black">
                      {thumb ? (
                        <img
                          src={getThumbnailUrl(thumb)}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageOff size={18} className="text-zv-ink-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-bold uppercase tracking-tight text-white">
                        {bike.title}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-zv-ink-500">
                        {bike.brand?.name ?? ''} {bike.model} · {bike.year}
                      </p>
                      <select
                        value={bike.status}
                        disabled={updatingStatusId === bike.id}
                        onChange={(event) =>
                          void changeStatus(bike, event.target.value as BikeStatus)
                        }
                        aria-label={`Estado de ${bike.title}`}
                        className={`mt-2.5 min-h-11 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider outline-none disabled:opacity-50 ${statusBadgeClass(bike.status)}`}
                      >
                        {(Object.keys(STATUS_LABELS) as BikeStatus[]).map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                    <span className="break-words font-display text-base font-extrabold tracking-tight text-zv-orange sm:text-lg">
                      {bike.price.toLocaleString('es-AR')} {bike.currency}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/motos/${bike.id}/editar`}
                        className="flex h-11 w-11 items-center justify-center border border-white/15 text-zv-ink-300 transition-colors hover:border-zv-orange hover:text-zv-orange"
                        title="Editar"
                        aria-label="Editar publicación"
                      >
                        <Edit2 size={17} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setBikeToDelete(bike)}
                        className="flex h-11 w-11 items-center justify-center border border-white/15 text-zv-ink-300 transition-colors hover:border-zv-orange hover:bg-zv-orange hover:text-zv-black"
                        title="Eliminar"
                        aria-label="Eliminar publicación"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vista escritorio: tabla con scroll horizontal. */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zv-black/50 text-[10px] uppercase tracking-[0.18em] text-zv-ink-500">
                <th className="px-5 py-4 font-bold">Moto</th>
                <th className="px-4 py-4 font-bold">Año</th>
                <th className="px-4 py-4 font-bold">Precio</th>
                <th className="px-4 py-4 font-bold">Estado</th>
                <th className="px-5 py-4 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-zv-ink-500">
                    Cargando publicaciones…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-zv-ink-500">
                    No se encontraron publicaciones.
                  </td>
                </tr>
              ) : (
                filtered.map((bike) => {
                  const thumb = getThumb(bike);
                  return (
                    <tr
                      key={bike.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-zv-black">
                            {thumb ? (
                              <img
                                src={getThumbnailUrl(thumb)}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageOff size={16} className="text-zv-ink-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-bold uppercase tracking-tight text-white">
                              {bike.title}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-zv-ink-500">
                              {bike.brand?.name ?? ''} {bike.model}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-zv-ink-300">
                        {bike.year}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-display text-base font-extrabold tracking-tight text-zv-orange">
                          {bike.price.toLocaleString('es-AR')} {bike.currency}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={bike.status}
                          disabled={updatingStatusId === bike.id}
                          onChange={(event) =>
                            void changeStatus(bike, event.target.value as BikeStatus)
                          }
                          aria-label={`Estado de ${bike.title}`}
                          className={`min-h-10 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider outline-none disabled:opacity-50 ${statusBadgeClass(bike.status)}`}
                        >
                          {(Object.keys(STATUS_LABELS) as BikeStatus[]).map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/motos/${bike.id}/editar`}
                            className="flex h-10 w-10 items-center justify-center border border-white/15 text-zv-ink-300 transition-colors hover:border-zv-orange hover:text-zv-orange"
                            title="Editar"
                            aria-label="Editar publicación"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setBikeToDelete(bike)}
                            className="flex h-10 w-10 items-center justify-center border border-white/15 text-zv-ink-300 transition-colors hover:border-zv-orange hover:bg-zv-orange hover:text-zv-black"
                            title="Eliminar"
                            aria-label="Eliminar publicación"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {bikeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zv-black/85 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto border border-white/15 bg-zv-panel shadow-2xl"
          >
            <div className="h-[3px] w-16 bg-zv-orange" />
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
              <div>
                <span className="eyebrow">Confirmar acción</span>
                <h2
                  id="delete-dialog-title"
                  className="mt-3 font-display text-2xl font-black uppercase tracking-tight text-white"
                >
                  Eliminar publicación
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setBikeToDelete(null)}
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-zv-ink-400 transition-colors hover:border-zv-orange hover:text-white"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-sm leading-relaxed text-zv-ink-300">
                ¿Estás seguro de que querés eliminar{' '}
                <strong className="text-white">“{bikeToDelete.title}”</strong>? Esta
                acción no se puede deshacer.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setBikeToDelete(null)}
                  className="btn btn-ghost w-full px-6 sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deletingId !== null}
                  className="btn btn-orange w-full px-6 disabled:opacity-50 sm:w-auto"
                >
                  {deletingId === bikeToDelete.id
                    ? 'Eliminando…'
                    : 'Eliminar publicación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
