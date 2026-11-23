import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { Link } from '@/components/shared/Link';
import { Logo } from '@/components/shared/Logo';
import { authService } from '@/services/auth';
import { BUSINESS } from '@/lib/constants';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await authService.login({
        email,
        password,
      });
      authService.setSession(
        { accessToken, refreshToken },
        { id: email, email, role: 'admin' },
      );
      navigate('/admin/dashboard', { replace: true });
    } catch {
      setError('Credenciales inválidas. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-zv-black text-zv-white">
      <div className="grid min-h-dvh lg:grid-cols-2">
        {/* Panel de marca: identidad de competición, sin tarjetas genéricas. */}
        <div className="track-lines relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-zv-panel p-8 lg:flex xl:p-14">
          <div className="diagonal-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[3px] bg-zv-orange/80" aria-hidden="true" />

          <div className="relative flex items-center justify-between gap-4">
            <Logo onDark variant="lockup" className="h-11" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zv-ink-500">
              ZV / ADMIN
            </span>
          </div>

          <div className="relative max-w-xl">
            <span className="eyebrow">Acceso restringido</span>
            <div className="race-rule my-7" />
            <h1 className="font-display text-[clamp(2.8rem,5.5vw,5.4rem)] font-black uppercase leading-[0.86] tracking-[-0.055em] text-white">
              Panel de
              <br />
              <span className="text-zv-orange">operaciones.</span>
            </h1>
            <p className="mt-7 max-w-md text-sm leading-relaxed text-zv-ink-300">
              Gestión interna de motocicletas, imágenes y publicaciones del
              catálogo de {BUSINESS.name}.
            </p>
          </div>

          <div className="relative flex flex-col gap-2 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-zv-ink-500 sm:flex-row sm:items-end sm:justify-between">
            <span>{BUSINESS.tagline}</span>
            <span className="text-zv-ink-400">{BUSINESS.address}</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-10 inline-flex min-h-11 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zv-ink-400 transition-colors hover:text-zv-orange-soft"
            >
              <ArrowLeft size={16} /> Volver al sitio público
            </Link>

            <div className="border border-white/10 bg-zv-surface p-4 sm:p-9">
              <div className="mb-6 h-[3px] w-14 bg-zv-orange" />
              <span className="micro-label text-zv-orange-soft">Panel ZV</span>
              <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-[-0.045em] text-white">
                Ingresar
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zv-ink-400">
                Ingresá con las credenciales administrativas para continuar.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-6 border-l-2 border-zv-orange bg-zv-orange/10 px-4 py-3 text-sm text-zv-white"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="field-label mb-2 block">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zv-ink-500"
                    />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="username"
                      placeholder="admin@zavadivker.invalid"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="field h-12 rounded-none border-white/10 bg-zv-black pl-11 pr-4 placeholder:text-zv-ink-600"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="field-label mb-2 block">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zv-ink-500"
                    />
                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="field h-12 rounded-none border-white/10 bg-zv-black pl-11 pr-4 placeholder:text-zv-ink-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-orange mt-2 w-full py-4 disabled:opacity-50"
                >
                  {loading ? 'Ingresando…' : 'Ingresar al panel'}
                </button>
              </form>

              <p className="mt-8 border-t border-white/10 pt-5 text-center text-[11px] leading-relaxed text-zv-ink-500">
                Las credenciales se gestionan en el servidor. No compartas tu
                usuario ni contraseña.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
