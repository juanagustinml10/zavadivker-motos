import * as React from 'react';
import { MessageCircle, Truck, MapPin, ChevronRight, Wallet, FileCheck, HandCoins } from 'lucide-react';
import { Link } from '@/components/shared/Link';
import { PageIntro } from '@/components/public/PageIntro';
import { BUSINESS, buildWhatsAppLink } from '@/lib/constants';
import bikeDetail from '@/assets/bike-detail.webp';

const WHATSAPP_CONSULTA = buildWhatsAppLink(
  'Hola! Quisiera consultar por las opciones de financiación disponibles en ZAVADIVKER MOTOS.'
);

const STEPS = [
  {
    icon: <Wallet size={22} />,
    n: '01',
    title: 'Elegí tu moto',
    text: 'Navegá el catálogo completo y quedate con la unidad que más te interese: 0 km o usada.',
  },
  {
    icon: <FileCheck size={22} />,
    n: '02',
    title: 'Consultanos',
    text: 'Escribinos por WhatsApp con el modelo elegido y te informamos las opciones disponibles para tu caso.',
  },
  {
    icon: <HandCoins size={22} />,
    n: '03',
    title: 'Coordinamos la entrega',
    text: 'Definidos los detalles, coordinamos la retirada en la concesionaria o la entrega.',
  },
];

export const Financiacion: React.FC = () => (
  <div className="bg-zv-black text-zv-white">
    {/* Encabezado */}
    <PageIntro
      index="01"
      eyebrow={`${BUSINESS.name} · Comercial`}
      title={<>FINAN<span className="text-zv-orange">CIÓN</span></>}
      outline="FIN"
      align="center"
      size="large"
      description={
        <>
          <p>
            Consultanos por las opciones de financiación para la moto que te interesa. Cada operación se analiza
            por separado y las condiciones se confirman directamente con nosotros.
          </p>
          <p className="mt-2 text-xs text-zv-ink-500">
            No publicamos tasas, cuotas ni planes: la disponibilidad y las condiciones se informan al consultar.
          </p>
        </>
      }
      actions={
        <a href={WHATSAPP_CONSULTA} target="_blank" rel="noopener noreferrer" className="btn btn-orange px-8 py-4 text-sm">
          <MessageCircle size={18} /> Consultar por WhatsApp
        </a>
      }
    />

    {/* Cómo funciona */}
    <section className="container-zv py-16 sm:py-24">
      <div className="mb-10 flex flex-col gap-5 border-t border-zv-line pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="micro-label text-zv-orange-soft">Cómo funciona</span>
          <h2 className="mt-4 max-sm:break-words max-sm:text-3xl font-display text-5xl font-black uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-7xl">
            Elegí, consultá<br /><span className="text-zv-orange">y coordiná</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-zv-ink-400">Tres pasos, sin letra chica: cada consulta se responde de forma personalizada.</p>
      </div>

      <div className="grid gap-px border border-zv-line bg-zv-line md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="group relative bg-zv-panel p-7 transition-colors hover:bg-zv-surface">
            <div className="flex h-12 w-12 items-center justify-center border border-zv-orange/40 text-zv-orange-soft">
              {step.icon}
            </div>
            <p className="mt-7 micro-label text-zv-orange-soft">Paso {step.n}</p>
            <h3 className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-[-0.03em] text-white">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zv-ink-400">{step.text}</p>
            <span className="mt-6 block h-[2px] w-8 bg-zv-orange transition-all duration-300 group-hover:w-full" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>

    {/* Aviso honesto sobre condiciones */}
    <section className="relative overflow-hidden border-y border-zv-line bg-zv-panel">
      <img src={bikeDetail} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="absolute inset-0 bg-zv-panel/80" aria-hidden="true" />
      <div className="container-zv relative grid gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <span className="micro-label text-zv-orange-soft">Aclaración</span>
          <h2 className="mt-4 max-sm:break-words max-sm:text-3xl font-display text-5xl font-black uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-7xl">
            Las condiciones<br /><span className="text-zv-orange">se consultan</span>
          </h2>
        </div>
        <div className="relative lg:col-span-6 lg:col-start-7">
          <span className="absolute inset-y-0 -left-4 w-[3px] bg-zv-orange" aria-hidden="true" />
          <p className="text-xl leading-relaxed text-zv-ink-200">
            En ZAVADIVKER MOTOS no publicamos tasas, cuotas ni planes predefinidos. La disponibilidad y las condiciones
            de cada operación se informan al consultar, porque dependen de la unidad y de cada caso.
          </p>
          <a
            href={WHATSAPP_CONSULTA}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex min-h-11 items-center gap-2 border-b border-zv-orange pb-1 font-display text-xs font-extrabold uppercase tracking-[0.22em] text-zv-orange-soft transition-colors hover:text-white"
          >
            Abrir consulta por WhatsApp <ChevronRight size={15} />
          </a>
        </div>
      </div>
    </section>

    {/* Envíos y ubicación */}
    <section className="diagonal-lines border-b border-zv-line bg-zv-black">
      <div className="container-zv flex flex-col gap-6 py-16 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-zv-orange/40 text-zv-orange-soft sm:h-20 sm:w-20">
            <Truck size={32} />
          </div>
          <div>
            <p className="font-display text-3xl font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-4xl">{BUSINESS.shippingLabel}</p>
            <p className="mt-2 text-xs leading-relaxed text-zv-ink-400">{BUSINESS.address} · coordinamos tu entrega</p>
          </div>
        </div>
        <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.25em] text-zv-ink-500">
          <MapPin size={16} className="text-zv-orange" /> Tucumán, Argentina
        </span>
      </div>
    </section>

    {/* Cierre */}
    <section className="bg-zv-panel">
      <div className="container-zv flex flex-col items-start justify-between gap-8 py-16 sm:py-20 lg:flex-row lg:items-center">
        <div>
          <span className="micro-label text-zv-orange-soft">Hablemos</span>
          <h2 className="mt-4 max-w-2xl max-sm:break-words max-sm:text-3xl font-display text-4xl font-black uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-6xl">
            La financiación se consulta <span className="text-zv-orange">con nosotros</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-zv-ink-400">
            Ubicación: {BUSINESS.address}. Escribinos y te contamos qué opciones están disponibles.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto">
          <a href={WHATSAPP_CONSULTA} target="_blank" rel="noopener noreferrer" className="btn btn-orange px-8 py-4 text-xs">
            <MessageCircle size={17} /> Hablar con ZAVADIVKER MOTOS
          </a>
          <Link to="/motos" className="btn btn-ghost px-8 py-4 text-xs">Ver catálogo</Link>
        </div>
      </div>
    </section>
  </div>
);
