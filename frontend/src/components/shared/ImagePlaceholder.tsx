import * as React from 'react';

interface ImagePlaceholderProps {
  width?: number | string;
  height?: number | string;
  label?: string;
  className?: string;
}

/**
 * Imagen de marcador de posición para datos de prueba.
 * Sustituir por fotografías reales de las motos al integrar el módulo de uploads.
 */
export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  width = 400,
  height = 300,
  label = 'Imagen de prueba',
  className,
}) => {
  const w = Number(width) || 400;
  const h = Number(height) || 300;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${w} ${h}">
      <rect width="100%" height="100%" fill="#111418"/>
      <path d="M0 ${h * 0.72} L${w * 0.42} ${h * 0.2} L${w * 0.62} ${h * 0.42} L${w * 0.8} ${h * 0.25} L${w} ${h * 0.55} L${w} ${h} L0 ${h} Z" fill="#181C21"/>
      <path d="M24 24 H${Math.max(24, w - 24)} M24 24 V${Math.max(24, h - 24)}" stroke="#F45B21" stroke-opacity="0.45" stroke-width="2" fill="none"/>
      <rect x="24" y="${Math.max(24, h - 30)}" width="28" height="6" fill="#F45B21" fill-opacity="0.7"/>
      <text x="50%" y="52%" font-family="Space Grotesk, system-ui, sans-serif" font-size="15" letter-spacing="3" fill="#9299A1" text-anchor="middle" dominant-baseline="middle">${label}</text>
    </svg>
  `;
  const src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

  return (
    <img
      src={src}
      alt={label}
      width={width}
      height={height}
      className={className}
      style={{ backgroundColor: '#111418', color: '#9299A1' }}
    />
  );
};
