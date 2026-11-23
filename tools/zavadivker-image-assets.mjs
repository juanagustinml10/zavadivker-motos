/**
 * Descarga fotografías CC0 de Unsplash publicadas en Wikimedia Commons y
 * genera las imágenes editoriales optimizadas en WebP del proyecto.
 *
 * No reutiliza ninguna fotografía del proyecto SF MOTOS. Las originales se
 * descargan a un directorio temporal y no se versionan: en el repo quedan
 * sólo los WebP optimizados y el detalle de licencias en IMAGE_CREDITS.md.
 *
 * Uso: node tools/zavadivker-image-assets.mjs
 * sharp se resuelve desde backend/node_modules.
 */
import { createRequire } from 'node:module';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('../backend/node_modules/sharp');

const ROOT = path.resolve(import.meta.dirname, '..');
const ASSETS = path.join(ROOT, 'frontend/src/assets');
const TEMP = path.join(os.tmpdir(), 'zavadivker-photos');

const LICENSE = {
  name: 'CC0 1.0',
  url: 'https://creativecommons.org/publicdomain/zero/1.0/',
};

const jobs = [
  {
    output: 'hero-enduro.webp',
    width: 2400,
    title: 'Husqvarna racing',
    author: 'Eric Michael',
    unsplash: 'https://unsplash.com/photos/1Hvj6DUsW_w',
    page: 'https://commons.wikimedia.org/wiki/File:Husqvarna_racing_(Unsplash).jpg',
    source: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Husqvarna_racing_(Unsplash).jpg?width=2400',
    use: 'Hero principal: enduro en acción.',
  },
  {
    output: 'enduro-action.webp',
    width: 1900,
    title: 'Dennis Savenko 2017',
    author: 'Dennis Savenko',
    unsplash: 'https://unsplash.com/photos/t0oHikPfX4A',
    page: 'https://commons.wikimedia.org/wiki/File:Dennis_Savenko_2017_(Unsplash).jpg',
    source: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Dennis_Savenko_2017_(Unsplash).jpg?width=1900',
    use: 'Categoría usadas y sección territorial enduro.',
  },
  {
    output: 'enduro-detail.webp',
    width: 1700,
    title: 'Motorbike dirt road',
    author: 'Marcos Moraes',
    unsplash: 'https://unsplash.com/photos/inX5GIDNfAs',
    page: 'https://commons.wikimedia.org/wiki/File:Motorbike_dirt_road_(Unsplash).jpg',
    source: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Motorbike_dirt_road_(Unsplash).jpg?width=1700',
    use: 'Categoría 0 km y fondo del bloque de contacto.',
  },
  {
    output: 'category-new.webp',
    width: 1500,
    title: 'Dirtbike',
    author: 'Ilham Hanifa',
    unsplash: 'https://unsplash.com/photos/YrYzGRskxxs',
    page: 'https://commons.wikimedia.org/wiki/File:Dirtbike_(Unsplash).jpg',
    source: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Dirtbike_(Unsplash).jpg?width=1500',
    use: 'Categoría 0 km.',
  },
  {
    output: 'category-used.webp',
    width: 1500,
    title: 'Cameron Kirby 2016-06-27',
    author: 'Cameron Kirby',
    unsplash: 'https://unsplash.com/photos/99wAEOOdBss',
    page: 'https://commons.wikimedia.org/wiki/File:Cameron_Kirby_2016-06-27_(Unsplash).jpg',
    source: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cameron_Kirby_2016-06-27_(Unsplash).jpg?width=1500',
    use: 'Categoría usadas.',
  },
  {
    output: 'category-route.webp',
    width: 1600,
    title: 'David Popa 2015',
    author: 'David Popa',
    unsplash: 'https://unsplash.com/photos/0hgUvGPn9jc',
    page: 'https://commons.wikimedia.org/wiki/File:David_Popa_2015_(Unsplash).jpg',
    source: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/David_Popa_2015_(Unsplash).jpg?width=1600',
    use: 'Bloque “En movimiento” de Nosotros.',
  },
  {
    output: 'moto-cross.webp',
    width: 1700,
    title: 'Muddy motorcycle',
    author: 'Gabriel Sanchez',
    unsplash: 'https://unsplash.com/photos/7eKCe28OG6E',
    page: 'https://commons.wikimedia.org/wiki/File:Muddy_motorcycle_(Unsplash).jpg',
    source: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Muddy_motorcycle_(Unsplash).jpg?width=1700',
    use: 'Imagen editorial institucional.',
  },
  {
    output: 'street-desert.webp',
    width: 1700,
    title: 'Scenic motorcycle',
    author: 'Francisco Requena',
    unsplash: 'https://unsplash.com/photos/A9tP39BIn28',
    page: 'https://commons.wikimedia.org/wiki/File:Scenic_motorcycle_(Unsplash).jpg',
    source: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Scenic_motorcycle_(Unsplash).jpg?width=1700',
    use: 'Hero editorial de Nosotros.',
  },
  {
    output: 'bike-detail.webp',
    width: 1500,
    title: 'Motorcycle handlebars',
    author: 'Alexa Wirth',
    unsplash: 'https://unsplash.com/photos/18IuER9udWc',
    page: 'https://commons.wikimedia.org/wiki/File:Motorcycle_handlebars_(Unsplash).jpg',
    source: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Motorcycle_handlebars_(Unsplash).jpg?width=1500',
    use: 'Detalle mecánico en Financiación.',
  },
];

const headers = {
  'User-Agent': 'ZavadivkerMotos/1.0 (local asset curation; contact: info@zavadivkermotos.com.ar)',
  Accept: 'image/jpeg,image/*',
};

await mkdir(TEMP, { recursive: true });
await mkdir(ASSETS, { recursive: true });

for (const job of jobs) {
  const response = await fetch(job.source, { headers });
  if (!response.ok) throw new Error(`${job.output}: HTTP ${response.status}`);

  const downloaded = path.join(TEMP, path.basename(new URL(job.source).pathname));
  await writeFile(downloaded, Buffer.from(await response.arrayBuffer()));

  const info = await sharp(downloaded)
    .rotate()
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(ASSETS, job.output));

  console.log(
    `${job.output.padEnd(22)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`
  );
}

const credits = [
  '# Créditos fotográficos',
  '',
  'Todas las fotografías editoriales son fotografías reales de motocicletas,',
  'publicadas en Unsplash y alojadas en Wikimedia Commons bajo licencia',
  `[${LICENSE.name}](${LICENSE.url}). La licencia permite uso comercial y no exige atribución;`,
  'se incluye igualmente el crédito por cortesía. No se reutilizó ninguna imagen',
  'del proyecto SF MOTOS.',
  '',
  'Los archivos del repositorio son versiones redimensionadas y convertidas a WebP',
  'a partir de las fuentes originales indicadas. Para regenerarlos:',
  '`node tools/zavadivker-image-assets.mjs`.',
  '',
  '| Archivo | Fotografía | Autor | Uso | Fuente |',
  '|---|---|---|---|---|',
  ...jobs.map(
    (job) =>
      `| \`frontend/src/assets/${job.output}\` | ${job.title} | ${job.author} | ${job.use} | [Commons](${job.page}) · [Unsplash](${job.unsplash}) · [CC0](${LICENSE.url}) |`
  ),
  '',
];

await writeFile(path.join(ROOT, 'IMAGE_CREDITS.md'), credits.join('\n'), 'utf8');
await rm(TEMP, { recursive: true, force: true });
console.log('IMAGE_CREDITS.md actualizado');
