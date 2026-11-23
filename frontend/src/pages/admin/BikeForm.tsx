import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bike as BikeIcon,
  Check,
  CircleHelp,
  EyeOff,
  FileText,
  Gauge,
  Image as ImageIcon,
  Info,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';

import { Link } from '@/components/shared/Link';
import { bikesService, type CreateBikeInput } from '@/services/bikes';
import type { Bike, BikeCondition, BikeImage, BikeStatus, BikeUsage } from '@/types';
import { cn } from '@/lib/utils';
import { BIKE_USAGES, MAX_IMAGES_PER_BIKE, MAX_MODEL_YEAR, MODEL_YEARS } from '@/lib/constants';
import { usageLabel } from '@/lib/format';
import { getThumbnailUrl } from '@/lib/images';

const CONDITIONS: BikeCondition[] = ['NUEVA', 'USADA'];
const STEPS = [
  { id: 1, label: 'Datos', hint: 'Identificá la moto' },
  { id: 2, label: 'Estado', hint: '0 km o usada' },
  { id: 3, label: 'Detalles', hint: 'Ficha y características' },
  { id: 4, label: 'Fotografías', hint: 'Subí y ordená fotos' },
  { id: 5, label: 'Publicación', hint: 'Revisá y guardá' },
] as const;

const inputClass =
  'field h-12 rounded-none border-white/10 bg-zv-black px-4 text-sm text-zv-white placeholder:text-zv-ink-600';
const labelClass = 'field-label mb-2 block text-zv-ink-300';
const cardClass = 'min-w-0 border border-white/10 bg-zv-panel p-4 sm:p-8';
const buttonClass =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-none border px-5 py-3 font-display text-[11px] font-black uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-40';
const iconButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-none border border-white/10 bg-zv-elevated text-zv-ink-300 transition-colors hover:border-zv-orange hover:text-zv-orange disabled:cursor-not-allowed disabled:opacity-30';
const stepHeadingClass = 'mb-6 flex items-center gap-3';
const stepEyebrowClass = 'font-display text-xs font-black tracking-[0.28em] text-zv-orange';
const stepTitleClass = 'font-display text-lg font-black uppercase tracking-tight text-white';

interface FeatureDraft {
  id?: string;
  key: string;
  value: string;
}

interface FormValues {
  title: string;
  brandId: string;
  model: string;
  year: number;
  price: string;
  currency: string;
  condition: BikeCondition;
  /** '' representa "Sin definir" y se envía como null a la API. */
  usage: BikeUsage | '';
  displacementCc: string;
  mileageKm: string;
  usageHours: string;
  description: string;
  featured: boolean;
}

const emptyForm: FormValues = {
  title: '',
  brandId: '',
  model: '',
  year: MAX_MODEL_YEAR,
  price: '',
  currency: 'ARS',
  condition: 'USADA',
  usage: '',
  displacementCc: '',
  mileageKm: '',
  usageHours: '',
  description: '',
  featured: false,
};

const byOrder = (a: BikeImage, b: BikeImage) => a.order - b.order;

export const BikeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [features, setFeatures] = useState<FeatureDraft[]>([]);
  const [existingImages, setExistingImages] = useState<BikeImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    let active = true;
    bikesService.listBrands().then((data) => {
      if (active) setBrands(data);
    }).catch(() => {});

    if (isEdit && id) {
      bikesService.getById(id).then((b) => {
        if (!active) return;
        setBike(b);
        setForm({
          title: b.title,
          brandId: b.brandId,
          model: b.model,
          year: b.year,
          price: String(b.price),
          currency: b.currency,
          condition: b.condition,
          usage: b.usage ?? '',
          displacementCc: String(b.displacementCc ?? ''),
          mileageKm: String(b.mileageKm ?? ''),
          usageHours: b.condition === 'USADA' && b.usageHours ? String(b.usageHours) : '',
          description: b.description ?? '',
          featured: b.featured,
        });
        setFeatures(b.features.map((feature) => ({
          id: feature.id,
          key: feature.key,
          value: feature.value,
        })));
        setExistingImages([...b.images].sort(byOrder));
        setLoading(false);
      }).catch(() => {
        if (active) {
          setError('No se pudo cargar la publicación.');
          setLoading(false);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [isEdit, id]);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validSteps: Record<number, boolean> = {
    1: Boolean(form.title.trim()) && Boolean(form.brandId) && Boolean(form.model.trim()) && Number(form.price) > 0,
    2: form.condition === 'NUEVA' || form.condition === 'USADA',
    3: true,
    4: true,
    5: true,
  };
  const canSave = [1, 2, 3, 4].every((number) => validSteps[number]);

  const changeCondition = (condition: BikeCondition) =>
    setForm((prev) => ({
      ...prev,
      condition,
      // Kilómetros y horas no aplican a unidades 0 km: se descartan al cambiar de estado.
      mileageKm: condition === 'NUEVA' ? '' : prev.mileageKm,
      usageHours: condition === 'NUEVA' ? '' : prev.usageHours,
    }));

  const updateFeature = (index: number, patch: Partial<FeatureDraft>) =>
    setFeatures((prev) => prev.map((feature, i) => (i === index ? { ...feature, ...patch } : feature)));

  const handleNewImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      setNewImages((prev) => {
        const room = Math.max(
          0,
          MAX_IMAGES_PER_BIKE - existingImages.length - prev.length,
        );
        return [...prev, ...files.slice(0, room)];
      });
    }
    event.target.value = '';
  };

  const swap = <T,>(items: T[], from: number, to: number): T[] => {
    if (to < 0 || to >= items.length) return items;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  };

  const moveExisting = async (index: number, direction: -1 | 1) => {
    const next = swap(existingImages, index, index + direction);
    if (next === existingImages || !bike) return;
    const previous = existingImages;
    setExistingImages(next);
    try {
      const result = await bikesService.reorderImages(bike.id, next.map((image) => image.id));
      setExistingImages([...result.images].sort(byOrder));
    } catch {
      setExistingImages(previous);
      setError('No se pudo cambiar el orden de las fotografías.');
    }
  };

  const moveNew = (index: number, direction: -1 | 1) =>
    setNewImages((prev) => swap(prev, index, index + direction));

  const makePrimary = async (imageId: string) => {
    if (!bike) return;
    try {
      const result = await bikesService.setPrimaryImage(bike.id, imageId);
      setExistingImages([...result.images].sort(byOrder));
    } catch {
      setError('No se pudo seleccionar la fotografía principal.');
    }
  };

  const deleteExisting = async (imageId: string) => {
    if (!bike || !window.confirm('¿Eliminar esta fotografía?')) return;
    try {
      await bikesService.deleteImage(bike.id, imageId);
      setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
    } catch {
      setError('No se pudo eliminar la fotografía.');
    }
  };

  const save = async (status: BikeStatus) => {
    if (!canSave) {
      setStep(1);
      setError('Completá título, marca, modelo y precio antes de guardar.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const input: CreateBikeInput = {
        title: form.title.trim(),
        brandId: form.brandId,
        model: form.model.trim(),
        year: form.year,
        condition: form.condition,
        usage: form.usage || null,
        displacementCc: form.displacementCc ? Number(form.displacementCc) : null,
        mileageKm: form.mileageKm ? Number(form.mileageKm) : null,
        usageHours:
          form.condition === 'USADA' && form.usageHours !== ''
            ? Number(form.usageHours)
            : null,
        price: Number(form.price),
        currency: form.currency,
        description: form.description.trim() || null,
        features: features
          .filter((feature) => feature.key.trim() && feature.value.trim())
          .map((feature) => ({ key: feature.key.trim(), value: feature.value.trim() })),
        status,
        featured: form.featured,
      };

      let saved: Bike;
      if (isEdit && bike) saved = await bikesService.update(bike.id, input);
      else saved = await bikesService.create(input);

      if (newImages.length > 0) await bikesService.uploadImages(saved.id, newImages);
      navigate('/admin/motos');
    } catch {
      setError('No se pudo guardar la publicación. Revisá los datos e intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <p className="text-sm text-zv-ink-500">Cargando publicación…</p>
      </div>
    );
  }

  const imageCount = existingImages.length + newImages.length;

  return (
    <div className="pb-16">
      <header className="mb-8 border-b border-white/10 pb-7">
        <Link
          to="/admin/motos"
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zv-ink-400 transition-colors hover:text-zv-orange-soft"
        >
          <ArrowLeft size={16} /> Volver al listado
        </Link>
        <span className="eyebrow">
          {isEdit ? 'Edición' : 'Alta'} / Catálogo · Panel ZV
        </span>
        <h1 className="mt-5 break-words font-display text-[clamp(1.9rem,5.5vw,4rem)] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white sm:text-[clamp(2.4rem,5.5vw,4rem)]">
          {isEdit ? 'Editar publicación' : 'Nueva publicación'}
          <span className="text-zv-orange">.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zv-ink-400">
          Completá los pasos en orden. Podés guardar como borrador cuando quieras.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 border-l-2 border-zv-orange bg-zv-orange/10 px-4 py-3 text-sm text-zv-white"
        >
          <Info size={18} className="mt-0.5 shrink-0 text-zv-orange" />
          {error}
        </div>
      )}

      {/* Pasos: se navega hacia adelante solo con los datos válidos. */}
      <nav
        aria-label="Pasos de la publicación"
        className="mb-8 border border-white/10 bg-zv-panel p-3 sm:p-4"
      >
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zv-ink-500">
            Paso {step} de {STEPS.length}
          </p>
          <span className="h-[2px] w-12 bg-zv-orange" />
        </div>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STEPS.map((item) => {
            const active = step === item.id;
            const done = step > item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={item.id > step}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => setStep(item.id)}
                  className={cn(
                    'flex h-full min-h-16 w-full flex-col items-start gap-2 border px-3 py-3 text-left transition-colors',
                    active
                      ? 'border-zv-orange bg-zv-orange/10'
                      : done
                        ? 'border-white/10 bg-zv-elevated/60 hover:border-zv-orange/60'
                        : 'border-white/10 bg-transparent opacity-60'
                  )}
                >
                  <span className="flex w-full min-w-0 items-center gap-1.5">
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center font-display text-[11px] font-black',
                        active
                          ? 'bg-zv-orange text-zv-black'
                          : done
                            ? 'bg-zv-elevated text-zv-orange-soft'
                            : 'bg-white/5 text-zv-ink-600'
                      )}
                    >
                      {done ? <Check size={13} /> : item.id}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 break-words font-display text-xs font-black uppercase leading-tight tracking-tight',
                        active
                          ? 'text-white'
                          : done
                            ? 'text-zv-ink-300'
                            : 'text-zv-ink-600'
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                  <span className="hidden text-[11px] leading-tight text-zv-ink-500 sm:block">
                    {item.hint}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <form onSubmit={(event) => { event.preventDefault(); void save('DISPONIBLE'); }}>
          {/* Paso 1 — Datos */}
          {step === 1 && (
            <section className={cardClass}>
              <div className={stepHeadingClass}>
                <span className={stepEyebrowClass}>01</span>
                <span className="h-[2px] w-10 bg-zv-orange" />
                <h2 className={stepTitleClass}>Datos</h2>
              </div>
              <p className="-mt-2 mb-6 text-sm text-zv-ink-400">
                Lo básico para identificar la moto en el catálogo.
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                  <label htmlFor="bike-title" className={labelClass}>Título de la publicación</label>
                  <input
                    id="bike-title"
                    required
                    value={form.title}
                    onChange={(event) => update('title', event.target.value)}
                    placeholder="Ej.: Beta 300 RR Freenduro"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bike-brand" className={labelClass}>Marca</label>
                  <select
                    id="bike-brand"
                    required
                    value={form.brandId}
                    onChange={(event) => update('brandId', event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="bike-model" className={labelClass}>Modelo</label>
                  <input
                    id="bike-model"
                    required
                    value={form.model}
                    onChange={(event) => update('model', event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bike-cc" className={labelClass}>Cilindrada (cc)</label>
                  <input
                    id="bike-cc"
                    type="number"
                    min="0"
                    value={form.displacementCc}
                    onChange={(event) => update('displacementCc', event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bike-year" className={labelClass}>Año</label>
                  <select
                    id="bike-year"
                    value={String(form.year)}
                    onChange={(event) => update('year', Number(event.target.value))}
                    className={inputClass}
                  >
                    {MODEL_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="bike-price" className={labelClass}>Precio</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zv-ink-500">$</span>
                      <input
                        id="bike-price"
                        required
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(event) => update('price', event.target.value)}
                        className={cn(inputClass, '!pl-7')}
                      />
                    </div>
                    <select
                      aria-label="Moneda"
                      value={form.currency}
                      onChange={(event) => update('currency', event.target.value)}
                      className={cn(inputClass, '!w-20 !px-2')}
                    >
                      <option value="ARS">ARS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Paso 2 — Estado */}
          {step === 2 && (
            <section className={cardClass}>
              <div className={stepHeadingClass}>
                <span className={stepEyebrowClass}>02</span>
                <span className="h-[2px] w-10 bg-zv-orange" />
                <h2 className={stepTitleClass}>Estado</h2>
              </div>
              <p className="-mt-2 mb-6 text-sm text-zv-ink-400">
                Elegí si es 0 km o usada. Esto define qué datos se muestran después.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CONDITIONS.map((condition) => {
                  const selected = form.condition === condition;
                  return (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => changeCondition(condition)}
                      aria-pressed={selected}
                      className={cn(
                        'flex min-h-40 flex-col items-start gap-3 border p-5 text-left transition-colors',
                        selected
                          ? 'border-zv-orange bg-zv-orange/[0.08]'
                          : 'border-white/10 bg-zv-black/40 hover:border-white/25'
                      )}
                    >
                      <span className="flex w-full items-start justify-between gap-3">
                        <span className={cn(
                          'flex h-11 w-11 items-center justify-center border',
                          selected
                            ? 'border-zv-orange bg-zv-orange text-zv-black'
                            : 'border-white/10 bg-zv-elevated text-zv-ink-400'
                        )}>
                          {condition === 'NUEVA' ? <BikeIcon size={21} /> : <Gauge size={21} />}
                        </span>
                        {selected && (
                          <span className="tag border border-zv-orange/40 text-zv-orange-soft">
                            <Check size={12} /> Seleccionada
                          </span>
                        )}
                      </span>
                      <span className="font-display text-2xl font-black uppercase tracking-tight text-white">
                        {condition === 'NUEVA' ? '0 km' : 'Usada'}
                      </span>
                      <span className="max-w-xs text-xs leading-relaxed text-zv-ink-400">
                        {condition === 'NUEVA'
                          ? 'Sin kilómetros ni horas de uso declarados.'
                          : 'Podés cargar kilómetros y horas de uso (opcional).'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Paso 3 — Detalles */}
          {step === 3 && (
            <section className={cardClass}>
              <div className={stepHeadingClass}>
                <span className={stepEyebrowClass}>03</span>
                <span className="h-[2px] w-10 bg-zv-orange" />
                <h2 className={stepTitleClass}>Detalles</h2>
              </div>
              <p className="-mt-2 mb-6 text-sm text-zv-ink-400">
                Sumá información técnica y características. Todo es opcional.
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="bike-usage" className={labelClass}>Uso</label>
                  <select
                    id="bike-usage"
                    value={form.usage}
                    onChange={(event) => update('usage', event.target.value as BikeUsage | '')}
                    className={inputClass}
                  >
                    <option value="">Sin definir</option>
                    {BIKE_USAGES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <p className="text-[11px] leading-relaxed text-zv-ink-500">
                    Define en qué bloque del catálogo aparece: Enduro/Cross o Ruta.
                  </p>
                </div>
                {form.condition === 'USADA' && (
                  <div className="space-y-2">
                    <label htmlFor="bike-km" className={labelClass}>Kilometraje (km)</label>
                    <input
                      id="bike-km"
                      type="number"
                      min="0"
                      placeholder="Ej.: 12000"
                      value={form.mileageKm}
                      onChange={(event) => update('mileageKm', event.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}
                {form.condition === 'USADA' && (
                  <div className="space-y-2">
                    <label htmlFor="bike-hours" className={labelClass}>Horas de uso</label>
                    <input
                      id="bike-hours"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Ej.: 85 horas"
                      value={form.usageHours}
                      onChange={(event) => update('usageHours', event.target.value)}
                      className={inputClass}
                    />
                    <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-zv-ink-500">
                      <CircleHelp size={13} className="mt-0.5 shrink-0" />
                      Opcional y decimal. Solo se muestra en la ficha si es mayor a 0.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <label htmlFor="bike-description" className={labelClass}>Descripción</label>
                <textarea
                  id="bike-description"
                  rows={4}
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  className={cn(inputClass, 'h-auto min-h-28 resize-y py-3')}
                />
              </div>

              <div className="mt-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className={labelClass}>Características técnicas</p>
                    <p className="text-[11px] text-zv-ink-500">
                      Pares clave / valor. Ejemplo: Motor · 300 cc.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={features.length >= 30}
                    onClick={() => setFeatures((prev) => [...prev, { key: '', value: '' }])}
                    className={cn(buttonClass, 'w-full border-white/15 bg-zv-elevated/60 text-zv-ink-300 hover:border-zv-orange hover:text-white sm:w-auto')}
                  >
                    <Plus size={16} /> Agregar característica
                  </button>
                </div>
                <div className="space-y-3">
                  {features.length === 0 && (
                    <p className="border border-dashed border-white/15 px-4 py-6 text-center text-xs text-zv-ink-600">
                      Sin características cargadas.
                    </p>
                  )}
                  {features.map((feature, index) => (
                    <div key={feature.id ?? `nueva-${index}`} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <input
                        aria-label={`Nombre de la característica ${index + 1}`}
                        placeholder="Ej.: Suspensión delantera"
                        maxLength={80}
                        value={feature.key}
                        onChange={(event) => updateFeature(index, { key: event.target.value })}
                        className={inputClass}
                      />
                      <input
                        aria-label={`Valor de la característica ${index + 1}`}
                        placeholder="Ej.: Invertida 41 mm"
                        maxLength={200}
                        value={feature.value}
                        onChange={(event) => updateFeature(index, { value: event.target.value })}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        aria-label={`Eliminar característica ${index + 1}`}
                        onClick={() => setFeatures((prev) => prev.filter((_, i) => i !== index))}
                        className={cn(iconButtonClass, 'h-11 w-11 sm:h-[52px] sm:w-[52px] hover:border-zv-orange hover:text-zv-orange')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Paso 4 — Fotografías */}
          {step === 4 && (
            <section className={cardClass}>
              <div className={stepHeadingClass}>
                <span className={stepEyebrowClass}>04</span>
                <span className="h-[2px] w-10 bg-zv-orange" />
                <h2 className={stepTitleClass}>Fotografías</h2>
              </div>
              <p className="-mt-2 mb-4 text-sm text-zv-ink-500">
                Subí imágenes, elegí la portada y ordenálas. Se guardan al guardar la publicación.
              </p>
              <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zv-ink-500">
                <span>↑ ↓ = ordenar</span>
                <span>✓ = usar como portada</span>
                <span>✕ = quitar</span>
              </div>

              {existingImages.length > 0 && (
                <div className="mb-8">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zv-ink-500">Fotos de la publicación</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {existingImages.map((image, index) => (
                      <div key={image.id} className="overflow-hidden border border-white/10 bg-zv-black">
                        <div className="relative aspect-square">
                          <img src={getThumbnailUrl(image.url)} alt="" className="h-full w-full object-cover" />
                          {image.isPrimary && (
                            <span className="absolute left-2 top-2 border border-zv-orange/60 bg-zv-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zv-orange-soft backdrop-blur">
                              Portada
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-1 border-t border-white/10 bg-zv-elevated/60 p-1.5 sm:flex sm:items-center sm:justify-center sm:gap-1.5 sm:p-2">
                          <button
                            type="button"
                            aria-label={`Mover foto ${index + 1} hacia arriba`}
                            disabled={index === 0}
                            onClick={() => void moveExisting(index, -1)}
                            className={cn(iconButtonClass, 'h-11 w-full sm:w-11')}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Mover foto ${index + 1} hacia abajo`}
                            disabled={index === existingImages.length - 1}
                            onClick={() => void moveExisting(index, 1)}
                            className={cn(iconButtonClass, 'h-11 w-full sm:w-11')}
                          >
                            <ArrowDown size={14} />
                          </button>
                          {!image.isPrimary && (
                            <button
                              type="button"
                              title="Usar como portada"
                              aria-label={`Usar foto ${index + 1} como portada`}
                              onClick={() => void makePrimary(image.id)}
                              className={cn(iconButtonClass, 'h-11 w-full sm:w-11')}
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Eliminar fotografía"
                            aria-label={`Eliminar foto ${index + 1}`}
                            onClick={() => void deleteExisting(image.id)}
                            className={cn(iconButtonClass, 'h-11 w-full hover:border-zv-orange hover:text-zv-orange sm:w-11')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newImages.length > 0 && (
                <div className="mb-8">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zv-ink-500">Fotos nuevas (se suben al guardar)</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {newImages.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex min-h-40 flex-col items-center justify-between gap-3 border border-dashed border-white/20 bg-zv-black/40 p-3">
                        <div className="flex w-full flex-col items-center gap-2 pt-2">
                          <ImageIcon size={24} className="text-zv-ink-500" />
                          <span className="w-full truncate text-center text-[10px] text-zv-ink-400">{file.name}</span>
                        </div>
                        <div className="grid w-full grid-cols-3 gap-1 sm:flex sm:items-center sm:justify-center sm:gap-1.5">
                          <button
                            type="button"
                            aria-label={`Mover foto nueva ${index + 1} antes`}
                            disabled={index === 0}
                            onClick={() => moveNew(index, -1)}
                            className={cn(iconButtonClass, 'h-11 w-full sm:w-11')}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Mover foto nueva ${index + 1} después`}
                            disabled={index === newImages.length - 1}
                            onClick={() => moveNew(index, 1)}
                            className={cn(iconButtonClass, 'h-11 w-full sm:w-11')}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Quitar foto nueva ${index + 1}`}
                            onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== index))}
                            className={cn(iconButtonClass, 'h-11 w-full hover:border-zv-orange hover:text-zv-orange sm:w-11')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-zv-black/40 p-8 text-center transition-colors hover:border-zv-orange hover:bg-zv-orange/5">
                <span className="flex h-12 w-12 items-center justify-center bg-zv-orange/10">
                  <Upload size={24} className="text-zv-orange" />
                </span>
                <span className="font-display text-sm font-black uppercase tracking-wide text-white">
                  Tocá para agregar fotografías
                </span>
                <span className="text-[11px] text-zv-ink-500">JPG, PNG o WebP · hasta {MAX_IMAGES_PER_BIKE} fotos por publicación</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleNewImages}
                  className="hidden"
                />
              </label>
              {imageCount > 0 && (
                <p className="mt-4 text-xs text-zv-ink-500">{imageCount} fotografía(s) en total.</p>
              )}
            </section>
          )}

          {/* Paso 5 — Publicación */}
          {step === 5 && (
            <section className={cardClass}>
              <div className={stepHeadingClass}>
                <span className={stepEyebrowClass}>05</span>
                <span className="h-[2px] w-10 bg-zv-orange" />
                <h2 className={stepTitleClass}>Publicación</h2>
              </div>
              <p className="-mt-2 mb-6 text-sm text-zv-ink-400">
                Revisá el resumen y elegí cómo guardar.
              </p>

              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="border border-white/10 bg-zv-black/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zv-ink-500">La moto</p>
                  <p className="mt-2 truncate text-sm font-semibold text-white">{form.title || 'Sin título'}</p>
                  <p className="mt-1 text-xs text-zv-ink-500">{form.year} · {form.currency} {form.price || '—'}</p>
                  <p className="mt-1 text-xs text-zv-ink-500">Uso: {usageLabel(form.usage || null)}</p>
                </div>
                <div className="border border-white/10 bg-zv-black/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zv-ink-500">Estado</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {form.condition === 'NUEVA' ? '0 km' : 'Usada'}
                  </p>
                  <p className="mt-1 text-xs text-zv-ink-500">
                    {form.usageHours && form.condition === 'USADA'
                      ? `${form.usageHours} horas de uso`
                      : 'Horas de uso: sin dato'}
                  </p>
                </div>
                <div className="border border-white/10 bg-zv-black/50 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zv-ink-500">
                    <FileText size={12} /> Contenido
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{imageCount} foto(s)</p>
                  <p className="mt-1 text-xs text-zv-ink-500">{features.filter((f) => f.key && f.value).length} característica(s)</p>
                </div>
              </div>

              <label className="mt-6 flex min-h-11 cursor-pointer items-center gap-3 select-none">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => update('featured', event.target.checked)}
                  className="h-5 w-5 rounded-none border-white/25 bg-zv-black text-zv-orange focus:ring-zv-orange"
                />
                <span className="text-sm font-medium text-zv-ink-300">Destacar en la portada</span>
              </label>

              <p className="mb-3 mt-8 text-[10px] font-bold uppercase tracking-widest text-zv-ink-500">
                Elegí qué hacer con esta publicación
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border border-white/15 bg-zv-black/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-none bg-zv-elevated text-zv-ink-300">
                      <EyeOff size={18} />
                    </span>
                    <span className="border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zv-ink-400">
                      Privado
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">Guardar como borrador</p>
                  <p className="mt-1 text-xs leading-relaxed text-zv-ink-500">
                    Queda guardado y solo se ve desde este panel. Podés seguir editando después.
                  </p>
                </div>
                <div className="border border-zv-orange/40 bg-zv-orange/[0.08] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-none bg-zv-orange/15 text-zv-orange-soft">
                      <Sparkles size={18} />
                    </span>
                    <span className="rounded-none border border-zv-orange/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zv-orange-soft">
                      Visible
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">Publicar</p>
                  <p className="mt-1 text-xs leading-relaxed text-zv-ink-400">
                    La moto pasa a estar disponible en el catálogo público.
                  </p>
                </div>
                <div className="border border-amber-500/30 bg-amber-500/[0.07] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-none bg-amber-500/15 text-amber-300">
                      <Info size={18} />
                    </span>
                    <span className="rounded-none border border-amber-500/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Visible
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">Marcar como reservada</p>
                  <p className="mt-1 text-xs leading-relaxed text-zv-ink-400">
                    Sigue en el catálogo con la leyenda “Reservada”.
                  </p>
                </div>
                <div className="border border-white/15 bg-zv-black/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-none bg-zv-elevated text-zv-ink-400">
                      <Check size={18} />
                    </span>
                    <span className="border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zv-ink-400">
                      Visible
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">Marcar como vendida</p>
                  <p className="mt-1 text-xs leading-relaxed text-zv-ink-500">
                    Sigue en el catálogo con la leyenda “Vendida”.
                  </p>
                </div>
              </div>
            </section>
          )}

      {/* Navegación entre pasos y acciones finales */}
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              className={cn(
                buttonClass,
                'w-full border-white/15 bg-zv-elevated/60 text-zv-ink-300 hover:border-zv-orange hover:text-white sm:w-auto'
              )}
            >
              <ArrowLeft size={16} /> Anterior
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {step < 5 && (
            <button
              type="button"
              disabled={!validSteps[step]}
              onClick={() => setStep((current) => current + 1)}
              className={cn(
                buttonClass,
                'w-full border-zv-orange bg-zv-orange text-zv-black hover:bg-zv-orange-soft disabled:border-white/10 disabled:bg-zv-elevated disabled:text-zv-ink-600 sm:w-auto'
              )}
            >
              Siguiente <ArrowRight size={16} />
            </button>
          )}
          {step === 5 && (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save('BORRADOR')}
                className={cn(
                  buttonClass,
                  'w-full border-white/15 bg-transparent text-zv-ink-300 hover:border-zv-orange hover:text-white sm:w-auto'
                )}
              >
                <Save size={16} /> {saving ? 'Guardando...' : 'Guardar como borrador'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className={cn(
                  buttonClass,
                  'w-full border-zv-orange bg-zv-orange text-zv-black hover:bg-zv-orange-soft sm:w-auto'
                )}
              >
                <Send size={16} /> {saving ? 'Publicando...' : 'Publicar'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save('RESERVADA')}
                className={cn(
                  buttonClass,
                  'w-full border-amber-500/60 bg-transparent text-amber-300 hover:bg-amber-500/10 sm:w-auto'
                )}
              >
                <Info size={16} /> {saving ? 'Guardando...' : 'Reservada'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save('VENDIDA')}
                className={cn(
                  buttonClass,
                  'w-full border-white/15 bg-transparent text-zv-ink-300 hover:border-white/40 hover:text-white sm:w-auto'
                )}
              >
                <Check size={16} /> {saving ? 'Guardando...' : 'Vendida'}
              </button>
            </>
          )}
        </div>
      </div>
      </form>
    </div>
  );
};
