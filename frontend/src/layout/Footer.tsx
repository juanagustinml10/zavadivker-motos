import * as React from 'react';
import { Link } from '@/components/shared/Link';
import { Logo } from '@/components/shared/Logo';
import { buildWhatsAppLink, BUSINESS } from '@/lib/constants';
import { ArrowUpRight, LockKeyhole, MapPin, MessageCircle } from 'lucide-react';

const LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Inventario', to: '/motos' },
  { label: 'Enduro / Cross', to: '/motos?usage=ENDURO_CROSS' },
  { label: 'Motos 0 km', to: '/motos?condition=NUEVA' },
  { label: 'Motos usadas', to: '/motos?condition=USADA' },
  { label: 'Financiación', to: '/financiacion' },
  { label: 'Nosotros', to: '/nosotros' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Favoritos', to: '/favoritos' },
  { label: 'Comparador', to: '/comparador' },
];

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => (
  <footer className="relative overflow-hidden border-t border-white/10 bg-zv-black">
    <div className="h-[3px] w-full bg-zv-orange" aria-hidden="true" />
    <div className="track-lines pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
    <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-zv-orange/10 blur-3xl" aria-hidden="true" />

    <div className="container-zv relative py-14 md:py-20">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Link to="/" aria-label="ZAVADIVKER MOTOS — Inicio" className="inline-flex min-h-11 items-center">
            <Logo onDark variant="lockup" className="h-9 w-auto sm:h-12" />
          </Link>
          <p className="micro-label mt-6 text-zv-orange-soft">{BUSINESS.tagline}</p>
          <div className="mt-4 h-[2px] w-12 bg-zv-orange" aria-hidden="true" />
          <h2 className="mt-5 font-display text-3xl font-black uppercase leading-[0.95] tracking-[-0.05em] text-white sm:text-4xl">
            Hechos para andar.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zv-ink-400">
            {BUSINESS.specialty}
          </p>
          <a
            href={buildWhatsAppLink(BUSINESS.whatsappGeneralMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-orange mt-7 px-5"
          >
            <MessageCircle size={16} />
            Escribinos
          </a>
        </div>

        <nav className="lg:col-span-3" aria-label="Enlaces del sitio">
          <p className="micro-label mb-4 text-zv-ink-500">Navegación</p>
          <ul className="grid grid-cols-2 gap-x-5 sm:grid-cols-3 lg:grid-cols-2">
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="group inline-flex min-h-10 items-center gap-2 text-sm text-zv-ink-400 transition-colors hover:text-white"
                >
                  <span className="h-[2px] w-2 bg-zv-orange transition-all group-hover:w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <p className="micro-label mb-4 text-zv-ink-500">Contacto</p>
          <ul className="space-y-3 text-sm text-zv-ink-400">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="mt-3 shrink-0 text-zv-orange" />
              <a
                href={BUSINESS.addressLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-start gap-1 transition-colors hover:text-white"
              >
                <span className="break-words">{BUSINESS.address}</span>
                <ArrowUpRight size={13} className="mt-1 shrink-0" />
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MessageCircle size={16} className="mt-3 shrink-0 text-zv-orange" />
              <a
                href={buildWhatsAppLink(BUSINESS.whatsappGeneralMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center transition-colors hover:text-white"
              >
                {BUSINESS.phoneDisplay} · WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs text-zv-ink-500">
            © {CURRENT_YEAR} {BUSINESS.name} · {BUSINESS.address}
          </p>
          <Link
            to="/admin/login"
            className="mt-4 inline-flex min-h-10 items-center gap-2 border border-white/15 px-3 py-2 text-[11px] text-zv-ink-400 transition-colors hover:border-zv-orange hover:text-white"
          >
            <LockKeyhole size={13} className="shrink-0 text-zv-orange-soft" aria-hidden="true" />
            Acceso administrativo
          </Link>
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-zv-ink-600 lg:text-right">
          Fotografías: Unsplash / Wikimedia Commons (CC0 1.0).
        </p>
      </div>
    </div>
  </footer>
);
