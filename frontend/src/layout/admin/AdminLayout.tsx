import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Motorbike,
  Menu,
  Plus,
  LogOut,
  X,
} from 'lucide-react';
import { Link } from '@/components/shared/Link';
import { Logo } from '@/components/shared/Logo';
import { authService } from '@/services/auth';
import { BUSINESS } from '@/lib/constants';

const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Panel', icon: LayoutDashboard, index: '01' },
  { to: '/admin/motos', label: 'Motocicletas', icon: Motorbike, index: '02' },
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-zv-black text-zv-white">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-zv-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        id="menu-admin"
        className={`fixed inset-y-0 left-0 z-40 flex w-[17rem] max-w-[85vw] flex-col border-r border-white/10 bg-zv-panel transition-transform duration-200 md:relative md:z-auto md:w-64 md:max-w-none md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[4.5rem] shrink-0 items-center justify-between gap-2 border-b border-white/10 px-5">
          <Link
            to="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex min-h-11 min-w-0 items-center gap-3"
            aria-label={`${BUSINESS.name} — Panel administrativo`}
          >
            <Logo onDark variant="compact" className="h-7 md:h-8" />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-zv-ink-300 transition-colors hover:border-zv-orange hover:text-white md:hidden"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-5">
          <span className="micro-label text-zv-orange">ZV / ADMIN</span>
          <p className="mt-2 font-display text-xl font-black uppercase tracking-tight text-white">
            Panel de control
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navegación del panel">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zv-ink-500">
            Navegación
          </p>
          <div className="space-y-1">
            {ADMIN_NAV.map(({ to, label, icon: Icon, index }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex min-h-12 items-center gap-3 border-l-2 px-3 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'border-zv-orange bg-zv-orange/10 text-white'
                      : 'border-transparent text-zv-ink-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1">{label}</span>
                <span className="font-mono text-[10px] text-zv-ink-600 transition-colors group-hover:text-zv-orange">
                  {index}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex min-h-12 items-center gap-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zv-ink-400 transition-colors hover:text-zv-orange-soft"
          >
            <span aria-hidden="true">←</span> Ver sitio público
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-12 w-full items-center gap-3 border-t border-white/10 px-3 pt-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-zv-ink-400 transition-colors hover:bg-zv-orange/10 hover:text-white"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[4.5rem] shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-zv-black px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-zv-ink-300 transition-colors hover:border-zv-orange hover:text-white md:hidden"
              aria-label="Abrir menú"
              aria-expanded={sidebarOpen}
              aria-controls="menu-admin"
            >
              <Menu size={21} />
            </button>
            <span className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-zv-ink-400">
              Panel ZV <span className="text-zv-orange">/</span>{' '}
              <span className="text-zv-white">{BUSINESS.name}</span>
            </span>
          </div>
          <Link
            to="/admin/motos/nuevo"
            className="btn btn-orange shrink-0 px-4 py-2.5 text-[11px]"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nueva moto</span>
            <span className="sm:hidden">Nueva</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 lg:p-8">
          <div className="container-zv !px-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
