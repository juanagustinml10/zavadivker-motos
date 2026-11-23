import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  List,
  Motorbike,
  Plus,
} from 'lucide-react';
import { Link } from '@/components/shared/Link';
import { BUSINESS } from '@/lib/constants';
import { statsService } from '@/services/stats';

type StatsResponse = {
  totalBikes: number;
  available: number;
  reserved: number;
  sold: number;
  featured: number;
  totalViews: number;
};

type RecentBike = {
  id: string;
  title: string;
  status: string;
  views: number;
  createdAt: string;
};

const STAT_ICONS = [Motorbike, CheckCircle2, Clock3, CreditCard, Activity];
const STAT_LABELS = [
  'Total de publicaciones',
  'Disponibles',
  'Reservadas',
  'Vendidas',
  'Visitas totales',
];

export const Dashboard = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recent, setRecent] = useState<RecentBike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      statsService.getDashboardStats().catch(() => null),
      statsService.getRecentBikes().catch(() => null),
    ]).then(([statsRes, recentRes]) => {
      if (cancelled) return;
      setStats(statsRes ?? null);
      setRecent(recentRes ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const values = stats
    ? [
        stats.totalBikes,
        stats.available,
        stats.reserved,
        stats.sold,
        stats.totalViews,
      ]
    : Array.from({ length: 5 }, () => null);

  return (
    <div className="pb-4">
      <header className="mb-9 flex flex-col gap-6 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">Resumen general / Panel ZV</span>
          <h1 className="mt-5 break-words font-display text-[clamp(2.1rem,6vw,4.6rem)] font-black uppercase leading-[0.86] tracking-[-0.055em] text-white sm:text-[clamp(2.6rem,6vw,4.6rem)]">
            Dashboard<span className="text-zv-orange">.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zv-ink-400">
            Estado de las publicaciones del catálogo {BUSINESS.name}.
          </p>
        </div>
        <Link
          to="/admin/motos/nuevo"
          className="btn btn-orange self-start px-6 py-4 sm:self-auto"
        >
          <Plus size={17} /> Nueva publicación
        </Link>
      </header>

      <section aria-label="Indicadores del catálogo" className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="section-index">01 / Indicadores</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zv-ink-600">
            En vivo
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-5">
          {STAT_LABELS.map((label, index) => {
            const Icon = STAT_ICONS[index];
            return (
              <div
                key={label}
                className="relative min-h-[9rem] bg-zv-panel p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 break-words text-[10px] font-bold uppercase leading-tight tracking-[0.14em] text-zv-ink-400 max-sm:tracking-[0.06em]">
                    {label}
                  </p>
                  <Icon size={16} className="shrink-0 text-zv-orange" />
                </div>
                <p className="mt-6 font-display text-3xl font-black leading-none text-white sm:text-4xl">
                  {loading ? '--' : values[index] ?? '--'}
                </p>
                <span
                  className={`absolute bottom-0 left-0 h-[2px] ${index === 0 ? 'w-16 bg-zv-orange' : 'w-8 bg-white/20'}`}
                />
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col border border-white/10 bg-zv-panel">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
            <div>
              <p className="section-index">02 / Actividad</p>
              <h2 className="mt-3 max-sm:break-words max-sm:text-xl font-display text-2xl font-black uppercase tracking-tight text-white">
                Publicaciones recientes
              </h2>
              <p className="mt-1.5 text-xs text-zv-ink-500">
                Últimas motocicletas cargadas en el sistema.
              </p>
            </div>
            <span className="font-mono text-[11px] text-zv-orange-soft">
              {recent.length.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex-1 p-5 sm:p-6">
            {loading ? (
              <p className="py-10 text-center text-sm text-zv-ink-500">Cargando…</p>
            ) : recent.length === 0 ? (
              <p className="py-10 text-center text-sm text-zv-ink-500">
                No hay publicaciones recientes.
              </p>
            ) : (
              <ol className="divide-y divide-white/10">
                {recent.map((bike, index) => (
                  <li
                    key={bike.id}
                    className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <span className="font-mono text-[10px] text-zv-ink-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-zv-elevated">
                      <Motorbike size={17} className="text-zv-orange" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {bike.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zv-ink-500">
                        {new Date(bike.createdAt).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-zv-ink-400">
                      {bike.views} vistas
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="border-t border-white/10 p-5 sm:p-6">
            <Link
              to="/admin/motos"
              className="inline-flex min-h-11 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zv-orange-soft transition-colors hover:text-white"
            >
              Ver todas <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>

        <section className="flex flex-col border border-white/10 bg-zv-panel">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <p className="section-index">03 / Atajos</p>
            <h2 className="mt-3 font-display text-2xl font-black uppercase tracking-tight text-white">
              Accesos rápidos
            </h2>
            <p className="mt-1.5 text-xs text-zv-ink-500">
              Operaciones frecuentes del panel.
            </p>
          </div>

          <div className="flex-1 space-y-3 p-5 sm:p-6">
            <Link
              to="/admin/motos/nuevo"
              className="group flex min-h-[4.5rem] items-center gap-4 border border-white/10 bg-zv-elevated/60 p-4 transition-colors hover:border-zv-orange hover:bg-zv-orange/[0.06]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-zv-orange text-zv-black">
                <Plus size={19} />
              </span>
              <span className="flex-1 text-sm font-bold uppercase tracking-wide text-white">
                Publicar nueva motocicleta
              </span>
              <ArrowUpRight
                size={17}
                className="shrink-0 text-zv-ink-500 transition-colors group-hover:text-zv-orange"
              />
            </Link>
            <Link
              to="/admin/motos"
              className="group flex min-h-[4.5rem] items-center gap-4 border border-white/10 bg-zv-elevated/60 p-4 transition-colors hover:border-zv-orange hover:bg-zv-orange/[0.06]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/15 text-zv-ink-300">
                <List size={19} />
              </span>
              <span className="flex-1 text-sm font-bold uppercase tracking-wide text-white">
                Gestionar publicaciones existentes
              </span>
              <ArrowUpRight
                size={17}
                className="shrink-0 text-zv-ink-500 transition-colors group-hover:text-zv-orange"
              />
            </Link>
          </div>

          <div className="border-t border-white/10 p-5 font-mono text-[10px] uppercase tracking-[0.22em] text-zv-ink-600 sm:p-6">
            {BUSINESS.name} / Panel ZV
          </div>
        </section>
      </div>
    </div>
  );
};
