import * as React from 'react';
import { ArrowRight, MapPin, MessageCircle, Search } from 'lucide-react';
import { Link } from '@/components/shared/Link';
import { Reveal } from '@/components/shared/Reveal';
import { HeroBike } from '@/components/public/HeroBike';
import { BUSINESS, buildWhatsAppLink } from '@/lib/constants';
import categoryRoute from '@/assets/category-route.webp';
import streetDesert from '@/assets/street-desert.webp';

const PILLARS = [
  { icon: <Search size={24} />, title: 'Catálogo claro', text: 'Cada publicación muestra fotos, datos principales y precio.', n: '01' },
  { icon: <MessageCircle size={24} />, title: 'Consulta directa', text: 'Escribinos por WhatsApp para saber más sobre una unidad.', n: '02' },
  { icon: <MapPin size={24} />, title: 'Punto de encuentro', text: `Vení a vernos a ${BUSINESS.address}.`, n: '03' },
];

export const About: React.FC = () => (
  <div className="bg-zv-black text-zv-white">
    {/* Hero editorial */}
    <section className="relative overflow-hidden border-b border-zv-line bg-zv-black">
      <div className="grid lg:min-h-[86svh] lg:grid-cols-12">
        <div className="relative flex flex-col justify-end px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:col-span-6 lg:px-12 lg:py-24 xl:px-16">
          <span className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-zv-orange" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-10 left-4 select-none font-display text-[9rem] font-black leading-none text-outline lg:text-[13rem]" aria-hidden="true">
            ZM
          </span>
          <Reveal className="relative">
            <p className="eyebrow">{BUSINESS.name} / Nosotros</p>
            <h1 className="mt-6 font-display text-[clamp(2.2rem,8vw,6.8rem)] font-black uppercase leading-[0.82] tracking-[-0.06em] text-white break-words sm:text-[clamp(3.2rem,8vw,6.8rem)]">
              ZAVADIVKER<br /><span className="text-zv-orange">MOTOS</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-zv-ink-300 sm:text-lg">
              {BUSINESS.specialty} {BUSINESS.activity}
            </p>
            <div className="mt-8 flex items-center gap-5 border-l-2 border-zv-orange pl-5">
              <p className="font-display text-xl font-black uppercase leading-none tracking-[-0.03em] text-white sm:text-2xl">
                {BUSINESS.tagline}
              </p>
            </div>
            <a
              href={buildWhatsAppLink(BUSINESS.whatsappGeneralMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-orange mt-9 px-7 py-4 text-xs"
            >
              Hablemos por WhatsApp <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>

        <div className="relative min-h-[45svh] overflow-hidden lg:col-span-6">
          <img
            src={streetDesert}
            alt="Motocicleta de calle en un paisaje desértico"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[60%_50%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zv-black via-transparent to-transparent lg:bg-gradient-to-r lg:from-zv-black/60" aria-hidden="true" />
          <div className="absolute bottom-6 left-6 flex items-center gap-3 border border-white/20 bg-zv-black/80 px-4 py-2 backdrop-blur-sm sm:left-8">
            <span className="h-2 w-2 bg-zv-orange" />
            <span className="micro-label text-white">Enduro / Cross / Off-road</span>
          </div>
        </div>
      </div>
    </section>

    {/* Mirada */}
    <section className="relative overflow-hidden border-y border-zv-line bg-zv-panel">
      <div className="track-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-zv relative grid gap-10 py-16 sm:py-24 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <span className="micro-label text-zv-orange-soft">Nuestra mirada</span>
          <p className="mt-5 max-sm:break-words max-sm:text-3xl font-display text-5xl font-black uppercase leading-[0.85] tracking-[-0.04em] text-zv-orange sm:text-6xl">
            Más que<br />motos
          </p>
        </Reveal>
        <Reveal delay={90} className="lg:col-span-7 lg:col-start-6">
          <p className="text-2xl leading-relaxed text-zv-ink-200 sm:text-3xl">
            En ZAVADIVKER MOTOS vendemos <strong className="font-semibold text-white">motos 0 km y usadas</strong>.
            Buscamos que encuentres la información que necesitás para elegir.
          </p>
          <p className="mt-6 text-2xl leading-relaxed text-zv-ink-200 sm:text-3xl">
            Si querés ver una unidad o consultar por ella, <strong className="font-semibold text-zv-orange-soft">escribinos o pasate por la agencia</strong>.
          </p>
          <div className="mt-10 flex items-start gap-4 border-t border-zv-line pt-6">
            <MapPin size={20} className="mt-0.5 shrink-0 text-zv-orange" />
            <span className="font-display text-base font-bold uppercase tracking-[0.12em] text-white sm:text-lg">
              {BUSINESS.address}
            </span>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Imagen editorial */}
    <section className="relative">
      <div className="h-[280px] overflow-hidden sm:h-[420px] lg:h-[520px]">
        <HeroBike className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zv-black/90 via-zv-black/10 to-transparent" aria-hidden="true" />
      <div className="container-zv relative -mt-14 flex flex-wrap items-end justify-between gap-4 pb-10 sm:-mt-16">
        <div>
          <span className="micro-label text-zv-orange-soft">Editorial</span>
          <p className="mt-2 font-display text-3xl font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-5xl">
            0 km <span className="text-zv-orange">/</span> Usadas
          </p>
        </div>
        <span className="race-rule hidden sm:block" aria-hidden="true" />
      </div>
    </section>

    {/* Cómo trabajamos */}
    <section className="container-zv py-16 sm:py-24">
      <Reveal className="mb-10 flex flex-col gap-5 border-t border-zv-line pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="micro-label text-zv-orange-soft">Cómo trabajamos</span>
          <h2 className="mt-4 max-sm:break-words max-sm:text-3xl font-display text-5xl font-black uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-7xl">
            Sin <span className="text-zv-orange">vueltas</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-zv-ink-400">Información clara, consultas directas y un lugar al que podés venir.</p>
      </Reveal>
      <div className="grid gap-px border border-zv-line bg-zv-line md:grid-cols-3">
        {PILLARS.map((p, index) => (
          <Reveal key={p.title} delay={index * 80} className="group relative bg-zv-panel p-7 transition-colors hover:bg-zv-surface">
            <div className="flex h-12 w-12 items-center justify-center border border-zv-orange/40 text-zv-orange-soft">
              {p.icon}
            </div>
            <h3 className="mt-7 font-display text-2xl font-black uppercase tracking-[-0.03em] text-white">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zv-ink-400">{p.text}</p>
            <span className="mt-7 block h-[2px] w-8 bg-zv-orange transition-all duration-300 group-hover:w-full" aria-hidden="true" />
          </Reveal>
        ))}
      </div>
    </section>

    {/* En movimiento */}
    <section className="relative overflow-hidden border-y border-zv-line">
      <img src={categoryRoute} alt="Motocicleta en un camino de montaña" loading="lazy" className="aspect-[4/3] min-h-[320px] w-full object-cover object-[60%_40%] sm:aspect-auto sm:min-h-[480px] sm:object-[70%_20%]" />
      <div className="absolute inset-0 bg-zv-black/70" aria-hidden="true" />
      <div className="container-zv relative flex min-h-[320px] flex-col justify-center py-14 sm:min-h-[480px]">
        <Reveal className="max-w-lg">
          <span className="micro-label text-zv-orange-soft">En movimiento</span>
          <h2 className="mt-4 max-sm:break-words max-sm:text-3xl font-display text-5xl font-black uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-7xl">
            La moto se<br /><span className="text-zv-orange">vive afuera</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zv-ink-200">
            Nos gustan las motos que se usan. Mirá el catálogo, compará modelos y elegí la que mejor va con vos.
          </p>
        </Reveal>
      </div>
    </section>

    {/* Cierre */}
    <section className="bg-zv-panel">
      <div className="container-zv flex flex-col items-start justify-between gap-8 py-14 sm:py-20 lg:flex-row lg:items-center">
        <div>
          <span className="micro-label text-zv-orange-soft">Tu próxima moto</span>
          <p className="mt-4 font-display text-4xl font-black uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-6xl">
            Empieza <span className="text-zv-orange">acá</span>
          </p>
          <p className="mt-3 max-w-md text-sm text-zv-ink-400">{BUSINESS.specialty}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto">
          <Link to="/motos" className="btn btn-orange px-8 py-4 text-xs">Ver catálogo <ArrowRight size={16} /></Link>
          <Link to="/contacto" className="btn btn-ghost px-8 py-4 text-xs">Contactanos</Link>
        </div>
      </div>
    </section>
  </div>
);
