import * as React from 'react';
import { CircleAlert, RefreshCw } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { BUSINESS } from '@/lib/constants';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Red de seguridad ante errores de render no previstos: evita que la SPA
 * quede con el `<div id="root">` vacío (pantalla negra) y muestra una salida
 * clara. El error original se registra en consola; no se silencia.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ZAVADIVKER MOTOS — error de render:', error, info.componentStack);
  }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zv-black px-6 py-16 text-center text-zv-white">
        <div className="track-lines pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 select-none font-display text-[12rem] font-black leading-none text-outline sm:text-[18rem]">
          ZM
        </span>
        <div className="relative">
          <Logo onDark variant="compact" className="h-10" />
          <div className="mt-10 flex h-16 w-16 items-center justify-center border border-zv-orange/40 bg-zv-orange/5 text-zv-orange-soft">
            <CircleAlert size={32} />
          </div>
          <p className="mt-6 micro-label text-zv-orange-soft">{BUSINESS.name}</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl">
            Algo salió <span className="text-zv-orange">mal</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zv-ink-400">
            No pudimos mostrar esta página. Recargá para intentarlo de nuevo o volvé al inicio del sitio.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-orange px-7 py-4 text-xs"
            >
              <RefreshCw size={16} /> Recargar página
            </button>
            <a href="/" className="btn btn-ghost px-7 py-4 text-xs">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}
