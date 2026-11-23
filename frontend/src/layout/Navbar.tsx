import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from '@/components/shared/Link';
import { Logo } from '@/components/shared/Logo';
import { buildWhatsAppLink, BUSINESS } from '@/lib/constants';
import { ArrowUpRight, Menu, MessageCircle, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/motos', label: 'Inventario' },
  { to: '/motos?usage=ENDURO_CROSS', label: 'Enduro / Cross' },
  { to: '/motos?condition=NUEVA', label: '0 km' },
  { to: '/motos?condition=USADA', label: 'Usadas' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  /** Mantiene el drawer montado durante la animación de cierre. */
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const isLinkActive = (to: string) => {
    const [path, query = ''] = to.split('?');
    const samePath = path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);
    if (!samePath) return false;
    if (!query) return true;
    const expected = new URLSearchParams(query);
    const actual = new URLSearchParams(location.search);
    return Array.from(expected.entries()).every(([key, value]) => actual.get(key) === value);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react/set-state-in-effect -- sincroniza el montaje con la animación del drawer
      setMounted(true);
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // Bloqueo de scroll compatible con iOS: `overflow:hidden` en body solo no alcanza.
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    const scrollY = window.scrollY;
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous.overflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      window.scrollTo(0, scrollY);
      trigger?.focus();
    };
  }, [open]);

  // Cerrar al navegar (también con back/forward del navegador).
  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- cierra el drawer al cambiar de ruta
    setOpen(false);
    const onPopState = () => setOpen(false);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [location.pathname, location.search]);

  const overHero = location.pathname === '/' && !scrolled;

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* La capa con backdrop-filter va aparte: si estuviera en el header,
          convertiría al header en containing block del drawer `fixed`. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 transition-all duration-300 ${
          overHero
            ? 'bg-gradient-to-b from-black/80 via-black/35 to-transparent'
            : 'border-b border-white/10 bg-zv-black/95 backdrop-blur-xl'
        }`}
      />
      <div className="container-zv">
        <div className="flex h-[66px] items-center justify-between gap-3 sm:h-[70px] xl:h-[78px]">
          <Link to="/" aria-label="ZAVADIVKER MOTOS — Inicio" className="flex min-h-11 shrink-0 items-center">
            <Logo
              onDark
              variant="header"
              className="h-7 transition-transform duration-300 hover:scale-[1.02] sm:h-11 xl:h-10 2xl:h-12"
            />
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={() =>
                  `group relative whitespace-nowrap px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                    isLinkActive(link.to) ? 'text-zv-orange-soft' : 'text-white/65 hover:text-white'
                  }`
                }
                aria-current={isLinkActive(link.to) ? 'page' : undefined}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-3 right-3 h-[2px] origin-left bg-zv-orange transition-transform duration-300 ${
                    isLinkActive(link.to) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={buildWhatsAppLink(BUSINESS.whatsappGeneralMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-orange hidden px-5 py-2.5 text-[11px] lg:inline-flex"
            >
              <MessageCircle size={16} />
              Escribinos
            </a>
            <button
              ref={triggerRef}
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-zv-orange xl:hidden"
              aria-label="Abrir menú"
              aria-expanded={open}
              aria-controls="menu-movil"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {mounted && (
        <div className={`fixed inset-0 z-50 xl:hidden ${visible ? '' : 'pointer-events-none'}`}>
          <button
            type="button"
            className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          />
          <div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className={`absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col border-l border-white/10 bg-zv-panel shadow-2xl transition-transform duration-200 ease-out ${
              visible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex min-h-[70px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 pt-[env(safe-area-inset-top)] max-sm:min-h-[calc(66px+env(safe-area-inset-top))]">
              <Logo onDark variant="header" className="h-7 sm:h-8" />
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white"
                aria-label="Cerrar menú"
              >
                <X size={21} />
              </button>
            </div>
            <nav className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5" aria-label="Navegación móvil">
              <div className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={() =>
                      `flex min-h-12 items-center border-b border-white/10 py-3 font-display text-xl font-extrabold uppercase tracking-tight transition-colors sm:text-2xl ${
                        isLinkActive(link.to) ? 'text-zv-orange' : 'text-white hover:text-zv-orange-soft'
                      }`
                    }
                    aria-current={isLinkActive(link.to) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="shrink-0 border-t border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <a
                href={buildWhatsAppLink(BUSINESS.whatsappGeneralMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-orange w-full py-4"
              >
                <MessageCircle size={18} />
                Consultar por WhatsApp
              </a>
              <p className="mt-4 flex items-center justify-center gap-1 text-center text-[11px] text-white/40">
                {BUSINESS.address} <ArrowUpRight size={12} />
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
