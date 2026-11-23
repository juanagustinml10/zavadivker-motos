import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Compass,
  Gauge,
  MapPin,
  MessageCircle,
  Phone,
  SearchX,
} from 'lucide-react';
import { Link } from '@/components/shared/Link';
import { Logo } from '@/components/shared/Logo';
import { Reveal } from '@/components/shared/Reveal';
import { BikeCard } from '@/components/public/BikeCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { bikesService } from '@/services/bikes';
import { BUSINESS, buildWhatsAppLink } from '@/lib/constants';
import heroEnduro from '@/assets/hero-enduro.webp';
import enduroAction from '@/assets/enduro-action.webp';
import enduroDetail from '@/assets/enduro-detail.webp';
import type { Bike } from '@/types';

const BRANDS = [
  'KTM', 'HUSQVARNA', 'GASGAS', 'BETA', 'SHERCO', 'HONDA', 'YAMAHA', 'KAWASAKI', 'SUZUKI',
];

const BENEFITS = [
  {
    icon: <Gauge size={22} />,
    title: 'Inventario actualizado',
    text: 'Explorá nuestro catálogo de motos con fotografías, características y precios de cada unidad.',
  },
  {
    icon: <Compass size={22} />,
    title: 'Especialistas en cada terreno',
    text: 'Encontrá motos de enduro, off-road, urbanas y deportivas según tu estilo y necesidad.',
  },
  {
    icon: <BadgeCheck size={22} />,
    title: 'Detalles de cada modelo',
    text: 'Conocé las especificaciones, características y fotografías de cada moto antes de elegir.',
  },
  {
    icon: <MessageCircle size={22} />,
    title: 'Atención personalizada',
    text: 'Contactanos directamente por WhatsApp y recibí asesoramiento sobre la moto que te interesa.',
  },
];

/** Separador naranja entre tarjetas de beneficios (abajo en una columna, a la derecha en dos o más). */
const benefitDivider = (index: number): string => {
  if (index > 2) return '';
  const base = "relative after:absolute after:bottom-4 after:left-6 after:right-6 after:h-[2px] after:bg-zv-orange after:content-['']";
  if (index === 1) {
    return `${base} sm:after:bottom-6 lg:after:bottom-6 lg:after:left-auto lg:after:right-0 lg:after:top-6 lg:after:h-auto lg:after:w-[2px]`;
  }
  return `${base} sm:after:bottom-6 sm:after:left-auto sm:after:right-0 sm:after:top-6 sm:after:h-auto sm:after:w-[2px]`;
};

export const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Bike[]>([]);
  const [latest, setLatest] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(false);
  const [latestError, setLatestError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const latestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react/set-state-in-effect -- reinicio del estado antes de cada carga
    setLoading(true);
    setFeaturedError(false);
    setLatestError(false);
    Promise.allSettled([
      bikesService.list({ featured: true, limit: 3 }),
      bikesService.list({ limit: 4 }),
    ]).then(([featuredRes, latestRes]) => {
      if (cancelled) return;
      const featuredList = featuredRes.status === 'fulfilled' ? featuredRes.value.data : null;
      const latestList = latestRes.status === 'fulfilled' ? latestRes.value.data : null;
      setFeatured(Array.isArray(featuredList) ? featuredList : []);
      setLatest(Array.isArray(latestList) ? latestList : []);
      setFeaturedError(!Array.isArray(featuredList));
      setLatestError(!Array.isArray(latestList));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => setReloadKey((key) => key + 1);
  const waGeneral = buildWhatsAppLink(BUSINESS.whatsappGeneralMessage);
  const waFinanciacion = buildWhatsAppLink(
    'Hola! Quisiera consultar por las opciones de financiación disponibles en ZAVADIVKER MOTOS.'
  );
  const scrollLatest = (direction: number) => {
    latestRef.current?.scrollBy({ left: direction * 380, behavior: 'smooth' });
  };

  return (
    <div className="bg-zv-black text-zv-white">
      {/* ============ HERO CINEMATOGRÁFICO ============ */}
      <section className="relative flex min-h-[calc(100svh-66px)] flex-col overflow-hidden sm:min-h-[calc(100svh-70px)] xl:min-h-[calc(100svh-78px)]">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <img
            src={heroEnduro}
            alt="Motocicleta de enduro en un paisaje de montaña"
            fetchPriority="high"
            className="h-full w-full animate-drift object-cover object-[58%_50%] max-sm:animate-none sm:object-[68%_50%]"
          />
          <div className="absolute inset-0 bg-zv-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-zv-black via-zv-black/85 to-zv-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zv-black via-transparent to-black/30" />
          <div className="absolute inset-0 bg-zv-black/25 sm:hidden" />
          <div className="absolute inset-y-0 left-0 w-[3px] bg-zv-orange/80" />
        </div>

        <div className="container-zv relative flex flex-1 items-center py-10 sm:pb-20 sm:pt-10">
          <div className="max-w-5xl">
            <p
              className="animate-rise eyebrow mt-0 text-white/70 max-sm:text-xs sm:mt-8"
              style={{ animationDelay: '0.12s' }}
            >
              {BUSINESS.name}
            </p>
            <h1
              className="animate-rise mt-5 font-display text-[clamp(1.9rem,6vw,5rem)] font-black uppercase leading-[0.92] tracking-[-0.05em] text-white max-sm:mt-6 max-sm:text-[clamp(2.5rem,10.5vw,2.75rem)]"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="block sm:inline">Elegí tu moto.</span>
              <br className="hidden sm:block" />
              <span className="block sm:inline">Empezá a</span>
              <br className="hidden sm:block" />
              <span className="block text-zv-orange sm:inline">disfrutar.</span>
            </h1>
            <p
              className="animate-rise mt-5 max-w-lg text-sm leading-relaxed text-white/75 max-sm:mt-6 max-sm:text-base sm:mt-7 sm:text-lg"
              style={{ animationDelay: '0.3s' }}
            >
              Concesionaria de motos multimarcas y asesoramiento.
            </p>
            <div
              className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: '0.38s' }}
            >
              <Link to="/motos" className="btn btn-orange px-8 py-4 text-xs max-sm:py-5">
                Ver catálogo
                <ArrowRight size={17} />
              </Link>
              <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="btn btn-ghost px-8 py-4 text-xs max-sm:py-5">
                <MessageCircle size={17} />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Panel de datos sobre la fotografía */}
        <div className="container-zv relative pb-6 sm:pb-8">
          <div className="flex flex-col gap-5 border-t border-white/20 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pt-6">
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {[
                { value: '0 KM', label: 'y usadas' },
                { value: 'ENDURO', label: 'y off-road' },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline gap-2">
                  <span className="font-display text-xl font-black uppercase tracking-tight text-white">
                    {item.value}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-zv-orange-soft">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <a href="#inventario" className="group hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white sm:flex">
              Descubrir
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 transition-colors group-hover:border-zv-orange group-hover:text-zv-orange">
                <ArrowRight size={14} className="rotate-90" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ MARCAS ============ */}
      <section className="border-y border-white/10 bg-zv-panel">
        <div className="container-zv py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.3em] text-zv-ink-500">
              Trabajamos con
            </span>
            {/* Móvil: marquesina continua. Dos copias idénticas hacen que el
                ciclo no salte al volver al inicio (translateX(-50%)). */}
            <div className="flex overflow-hidden sm:hidden" aria-label="Marcas con las que trabajamos">
              <div className="flex w-max animate-marquee motion-reduce:animate-none">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 ? true : undefined}>
                    {BRANDS.map((brand) => (
                      <React.Fragment key={`${copy}-${brand}`}>
                        <span className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-white/60">
                          {brand}
                        </span>
                        <span className="px-4 text-zv-orange/60" aria-hidden="true">/</span>
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: fila original con separadores y scroll. */}
            <div className="scrollbar-none hidden flex-1 items-center gap-x-8 gap-y-3 overflow-x-auto whitespace-nowrap sm:flex sm:flex-wrap">
              {BRANDS.map((brand, index) => (
                <span key={brand} className="flex items-center gap-8">
                  <span className="font-display text-base font-extrabold uppercase tracking-[0.12em] text-white/55 transition-colors hover:text-zv-orange sm:text-lg">
                    {brand}
                  </span>
                  {index < BRANDS.length - 1 && (
                    <span className="text-zv-orange/50">/</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORÍAS ============ */}
      <section id="inventario" className="color-scheme-light bg-white py-16 text-zv-black [&_.eyebrow]:text-zv-orange sm:py-24 lg:py-32">
        <div className="container-zv">
          <Reveal className="mb-10 flex flex-col gap-6 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">01 / Categorías</p>
              <h2 className="mt-5 font-display text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-5xl lg:text-5xl xl:text-6xl">
                Descubrí todas las<br /><span className="text-zv-orange">posibilidades</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 lg:grid-cols-12">
            <Reveal delay={60} className="lg:col-span-6">
              <Link to="/motos?condition=NUEVA" className="group relative block h-[330px] overflow-hidden rounded-lg sm:h-[440px]">
                <img src={enduroDetail} alt="Moto de enduro en camino de tierra" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-zv-black via-zv-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <span className="micro-label text-zv-orange-soft">Unidades nuevas</span>
                  <h3 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">0 km</h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70 transition-colors group-hover:text-zv-orange">
                    Explorar <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-6">
              <Link to="/motos?condition=USADA" className="group relative block h-[330px] overflow-hidden rounded-lg sm:h-[440px]">
                <img src={enduroAction} alt="Moto de enduro en acción" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-zv-black via-zv-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <span className="micro-label text-zv-orange-soft">Oportunidades</span>
                  <h3 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">Usadas</h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70 transition-colors group-hover:text-zv-orange">
                    Explorar <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ DESTACADAS ============ */}
      <section className="border-y border-white/5 bg-zv-panel py-16 sm:py-24">
        <div className="container-zv">
          <Reveal className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">02 / Selección Zavadivker</p>
              <h2 className="mt-4 max-sm:break-words max-sm:text-3xl font-display text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl">
                Destacadas<span className="text-zv-orange">.</span>
              </h2>
            </div>
            <Link to="/motos?featured=true" className="btn btn-ghost px-6">
              Ver todas <ArrowRight size={16} />
            </Link>
          </Reveal>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : featuredError ? (
            <ErrorState compact onRetry={retry} />
          ) : featured.length === 0 ? (
            <EmptyState
              icon={<BadgeCheck size={30} />}
              code="00"
              title={<>Sin destacadas</>}
              description="Todavía no hay motos destacadas publicadas."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((bike, i) => (
                <Reveal key={bike.id} delay={i * 90}>
                  <BikeCard bike={bike} className="h-full" />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ ÚLTIMOS INGRESOS ============ */}
      <section className="color-scheme-light bg-white py-16 text-zv-black [&_.eyebrow]:text-zv-orange sm:py-24">
        <div className="container-zv">
          <Reveal className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">03 / Recién llegadas</p>
              <h2 className="mt-4 max-sm:break-words max-sm:text-3xl font-display text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl">
                Últimos ingresos
              </h2>
            </div>
            {!loading && !latestError && latest.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollLatest(-1)}
                  aria-label="Ver ingresos anteriores"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/20 text-zv-black transition-colors hover:border-zv-orange hover:text-zv-orange"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollLatest(1)}
                  aria-label="Ver más ingresos"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/20 text-zv-black transition-colors hover:border-zv-orange hover:text-zv-orange"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </Reveal>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} tone="light" />)}
            </div>
          ) : latestError ? (
            <ErrorState compact tone="light" onRetry={retry} />
          ) : latest.length === 0 ? (
            <EmptyState
              icon={<SearchX size={30} />}
              code="00"
              title={<>Catálogo vacío</>}
              description="Todavía no hay motos publicadas en el catálogo."
              tone="light"
            />
          ) : (
            <div ref={latestRef} className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
              {latest.slice(0, 4).map((bike) => (
                <div key={bike.id} className="w-[82vw] max-w-sm shrink-0 snap-start sm:w-[330px]">
                  <BikeCard bike={bike} tone="light" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ BENEFICIOS ============ */}
      <section className="border-y border-white/10 bg-zv-panel py-16 sm:py-24">
        <div className="container-zv">
          <Reveal className="mb-12 max-w-2xl">
            <p className="eyebrow">04 / Por qué Zavadivker</p>
            <h2 className="mt-5 max-sm:break-words max-sm:text-3xl font-display text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl">
              Todo en un mismo lugar.
            </h2>
          </Reveal>
          <div className="grid gap-0 overflow-hidden rounded-lg border border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit, index) => (
              <Reveal
                key={benefit.title}
                delay={index * 70}
                className={`bg-zv-panel p-6 sm:p-8 ${benefitDivider(index)}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zv-orange/40 text-zv-orange">
                  {benefit.icon}
                </div>
                <span className="mt-6 block text-[10px] font-bold tracking-[0.3em] text-zv-ink-600">0{index + 1}</span>
                <h3 className="mt-2 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zv-ink-400">{benefit.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINANCIACIÓN ============ */}
      <section className="border-y border-black/10 color-scheme-light bg-white py-16 text-zv-black [&_.eyebrow]:text-zv-orange sm:py-24">
        <div className="container-zv grid gap-10 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">05 / Financiación</p>
            <h2 className="mt-5 font-display text-3xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-5xl lg:text-5xl xl:text-6xl">
              Consulta<br /><span className="text-zv-orange">financiación</span>
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5">
            <p className="text-base leading-relaxed text-black/65">
              Cada operación se analiza por separado y las condiciones se confirman directamente con nosotros.
              No publicamos tasas, cuotas ni planes: la disponibilidad se informa al consultar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={waFinanciacion} target="_blank" rel="noopener noreferrer" className="btn btn-orange px-7 py-4">
                <MessageCircle size={17} /> Consultar por WhatsApp
              </a>
              <Link to="/financiacion" className="btn btn-ghost border-black/25 text-zv-black px-7 py-4">
                Ver financiación <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden">
        <img src={enduroDetail} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-zv-black/80" />
        <div className="container-zv relative py-16 sm:py-24">
          <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">06 / Hablemos</p>
              <h2 className="mt-5 max-w-2xl max-sm:break-words max-sm:text-3xl font-display text-5xl font-black uppercase leading-[0.88] tracking-[-0.05em] sm:text-7xl">
                ¿Buscás <span className="text-zv-orange">una moto?</span>
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-zv-ink-300">
                Consultanos por disponibilidad, precios o envíos. Te respondemos por WhatsApp.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="btn btn-orange px-7 py-4">
                <MessageCircle size={17} /> Escribinos ahora
              </a>
              <a href={`tel:+${BUSINESS.whatsappNumber}`} className="btn btn-ghost px-7 py-4">
                <Phone size={16} /> {BUSINESS.phoneDisplay}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CONTACTO ============ */}
      <section className="color-scheme-light bg-white py-16 text-zv-black [&_.eyebrow]:text-zv-orange [&_.micro-label]:text-zv-orange sm:py-24">
        <div className="container-zv">
          <Reveal className="mb-10 grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="eyebrow">07 / Ubicación</p>
              <h2 className="mt-5 max-sm:break-words max-sm:text-3xl font-display text-5xl font-black uppercase leading-[0.88] tracking-[-0.05em] sm:text-7xl">
                Vení a vernos.
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-black/60 lg:text-right">
              {BUSINESS.address}
            </p>
          </Reveal>

          <div className="grid gap-0 lg:grid-cols-12">
            <div className="overflow-hidden rounded-lg lg:col-span-7">
              <iframe
                title="ZAVADIVKER MOTOS — 9 de Julio 119, Juan B. Alberdi, Tucumán, Argentina"
                src="https://www.google.com/maps?q=9+de+Julio+119+Juan+B.+Alberdi+Tucuman+Argentina&output=embed"
                width="100%"
                height="420"
                className="block h-[320px] w-full grayscale sm:h-[460px]"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="relative z-10 -mt-4 rounded-lg border border-black/10 bg-zv-paper p-7 sm:p-9 lg:col-span-5 lg:col-start-8 lg:mt-0 lg:-ml-8">
              <Logo variant="compact" className="h-9" />
              <span className="micro-label mt-7 block text-zv-orange-soft">{BUSINESS.name} / Contacto</span>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={19} className="mt-0.5 shrink-0 text-zv-orange" />
                  <span className="font-semibold text-zv-black/90">{BUSINESS.address}</span>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle size={19} className="mt-0.5 shrink-0 text-zv-orange" />
                  <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-zv-black/90 transition-colors hover:text-zv-orange">
                    {BUSINESS.phoneDisplay} <span className="text-black/50">(WhatsApp)</span>
                  </a>
                </li>
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={BUSINESS.addressLink} target="_blank" rel="noopener noreferrer" className="btn btn-orange px-6">
                  <MapPin size={16} /> Cómo llegar
                </a>
                <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="btn btn-ghost border-black/25 text-zv-black px-6">
                  <Phone size={16} /> Escribinos
                </a>
              </div>
              <p className="mt-8 border-t border-black/10 pt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-black/50">
                {BUSINESS.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
