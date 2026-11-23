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
  <footer className="border-t border-white/10 bg-zv-black">
    <div className="container-zv py-10 md:py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
        <div>
          <Link to="/" aria-label="ZAVADIVKER MOTOS — Inicio" className="inline-flex min-h-11 items-center">
            <Logo onDark variant="lockup" className="h-8 sm:h-10" />
          </Link>
          <p className="mt-2 text-sm text-zv-ink-400">
            {BUSINESS.specialty} {BUSINESS.activity}
          </p>
        </div>
        <ul className="flex flex-col gap-1 text-sm text-zv-ink-300">
          <li>
            <a
              href={BUSINESS.addressLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-white"
            >
              <MapPin size={16} className="shrink-0 text-zv-orange" />
              <span className="break-words">{BUSINESS.address}</span>
              <ArrowUpRight size={13} className="shrink-0" />
            </a>
          </li>
          <li>
            <a
              href={buildWhatsAppLink(BUSINESS.whatsappGeneralMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-white"
            >
              <MessageCircle size={16} className="shrink-0 text-zv-orange" />
              {BUSINESS.phoneDisplay} · WhatsApp
            </a>
          </li>
        </ul>
      </div>

      <nav aria-label="Enlaces del sitio" className="mt-8 border-t border-white/10 pt-4">
        <ul className="flex flex-wrap gap-x-6">
          {LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className="inline-flex min-h-11 items-center text-sm text-zv-ink-300 transition-colors hover:text-zv-orange-soft"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-zv-ink-500 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p>© {CURRENT_YEAR} {BUSINESS.name}</p>
        <p>Fotografías: Unsplash / Wikimedia Commons (CC0 1.0).</p>
        <Link
          to="/admin/login"
          className="inline-flex min-h-11 items-center gap-2 self-start rounded border border-white/15 bg-zv-surface px-3 py-2 text-zv-ink-300 transition-colors hover:border-zv-orange/60 hover:bg-zv-elevated hover:text-white sm:self-auto"
        >
          <LockKeyhole size={13} className="shrink-0 text-zv-orange-soft" aria-hidden="true" />
          Acceso administrativo
        </Link>
      </div>
    </div>
  </footer>
);
