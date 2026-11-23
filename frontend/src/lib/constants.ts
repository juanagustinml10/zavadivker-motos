/**
 * Datos oficiales de ZAVADIVKER MOTOS.
 * Fuente única de verdad para la información institucional y comercial.
 * ⚠️ No agregar datos que no hayan sido confirmados oficialmente.
 */
export const BUSINESS = {
  name: 'ZAVADIVKER MOTOS',
  tagline: 'ENDURO · OFF-ROAD · MULTIMARCA',
  activity: 'Venta de motocicletas 0 km y usadas.',
  specialty: 'Concesionaria multimarca especializada en enduro, motocross y off-road.',
  // Dirección provisoria heredada de la instalación anterior, a confirmar por el cliente.
  address: '9 de Julio 119, Juan B. Alberdi, Tucumán, Argentina',
  addressLink:
    'https://maps.google.com/?q=9+de+Julio+119+Juan+B.+Alberdi+Tucuman+Argentina',
  phoneDisplay: '3814057359',
  whatsappNumber: '5493814057359',
  whatsappGeneralMessage: 'Hola! Quisiera recibir información sobre las motos de ZAVADIVKER MOTOS.',
  whatsappLink: 'https://wa.me/5493814057359',
  shippingLabel: 'Consultá por envíos',
} as const;

/** Año modelo máximo ofrecido (incluye la temporada siguiente). */
export const MAX_MODEL_YEAR = 2027;

/** Año modelo mínimo aceptado en el panel y en los filtros del catálogo. */
export const MIN_MODEL_YEAR = 2000;

/** Años disponibles, de más nuevo a más viejo. */
export const MODEL_YEARS = Array.from(
  { length: MAX_MODEL_YEAR - MIN_MODEL_YEAR + 1 },
  (_, index) => MAX_MODEL_YEAR - index,
);

/** Cantidad máxima de fotografías por publicación. */
export const MAX_IMAGES_PER_BIKE = 10;

/** Usos/disciplinas disponibles para clasificar una moto. */
export const BIKE_USAGES = [
  { value: 'ENDURO_CROSS', label: 'Enduro / Cross', title: 'ENDURO/CROSS' },
  { value: 'RUTA', label: 'Ruta', title: 'RUTA' },
] as const;

export const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const buildBikeWhatsAppLink = (bike: {
  brand?: { name: string } | null;
  model?: string;
  title: string;
  year?: number;
}) => {
  const label = bike.brand?.name && bike.model ? `${bike.brand.name} ${bike.model}` : bike.title;
  return buildWhatsAppLink(
    `Hola! Estoy interesado en la ${label} que vi publicada en ZAVADIVKER MOTOS. ¿Me podrían brindar más información?`
  );
};
