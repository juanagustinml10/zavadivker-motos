import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/layout/Navbar';
import { Footer } from '@/layout/Footer';

/**
 * Layout de las rutas públicas de ZAVADIVKER MOTOS.
 * Renderiza Navbar arriba, el contenido de la ruta en medio y Footer como cierre real de la página.
 */
export const PublicLayout: React.FC = () => (
  <div className="flex min-h-dvh flex-col bg-zv-black text-zv-white">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-none focus:bg-zv-orange focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-zv-black"
    >
      Saltar al contenido principal
    </a>
    <Navbar />
    <main id="main-content" className="min-w-0 flex-1 scroll-mt-[66px] sm:scroll-mt-[70px] xl:scroll-mt-[78px]">
      <Outlet />
    </main>
    <Footer />
  </div>
);
