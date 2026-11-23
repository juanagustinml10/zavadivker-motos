"""Genera las variantes web del logo oficial de ZAVADIVKER MOTOS.

Todo el arte se deriva del JPEG original: no se redibuja ni se inventa ningún
trazo. Se separan las tres piezas que ya están en el archivo (isotipo, letters
"ZAVADIVKER" y bloque naranja "MOTOS"), se elimina el fondo blanco y la franja
negra, y se recomponen en tres lockups:

* ``zavadivker-*-light/dark.png``  -> composición apilada original, sin fondo.
* ``zavadivker-lockup-*.png``      -> isotipo + wordmark en una línea.
* ``zavadivker-compact-*.png``     -> sólo wordmark (sidebar, menú).
* ``zavadivker-header-*.png``      -> isotipo + "ZAVADIVKER" en tinta plana y
  "MOTOS" en naranja (navbar).

La tinta neutra se adapta al fondo y el naranja original se conserva. La "Z"
del favicon se recorta del propio wordmark.

Uso: py -3 tools/zavadivker-logo-assets.py
Requiere: Pillow, numpy y scipy.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "logo zavadivker.jpeg"
OUT_DIR = ROOT / "frontend" / "public" / "logo"
PUBLIC_DIR = ROOT / "frontend" / "public"

BLACK = np.array([7, 8, 10], dtype=np.float32)
WHITE = np.array([246, 245, 242], dtype=np.float32)
ICON_BOTTOM = 722  # la franja negra del wordmark empieza en y=725
BAND_TOP = 725
MOTOS_TOP = 842
MOTOS_BOTTOM = 898

WORD_WIDTH = 890  # ancho de referencia del wordmark dentro de los lockups
WORD_GAP = 26     # separación original entre "ZAVADIVKER" y "MOTOS"
LOCKUP_GAP = 36   # separación entre isotipo y wordmark
PAD = 16


def extract_foreground(source: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    """Devuelve RGB sin el halo blanco y alpha suave, en el orden del original."""
    rgb = np.asarray(source.convert("RGB"), dtype=np.float32)
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    near_white = (rgb.min(axis=2) >= 232) & (spread <= 18)

    labels, _ = ndi.label(near_white, structure=np.ones((3, 3), dtype=np.uint8))
    border_ids = np.unique(
        np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])
    )
    background = np.isin(labels, border_ids)

    # El JPEG tiene un halo gris claro alrededor del trazo: se elimina sólo
    # donde toca el fondo ya detectado, nunca dentro del texto blanco interior.
    halo = ndi.binary_dilation(background, iterations=2)
    halo &= rgb.mean(axis=2) > 205
    halo &= spread < 38
    background |= halo

    alpha = 255.0 * (1.0 - ndi.gaussian_filter(background.astype(float), 0.65))
    alpha = np.clip(alpha, 0, 255)
    coverage = np.maximum(alpha / 255.0, 0.015)[..., None]

    # "Unmatte" contra el blanco original para que no quede un borde claro.
    foreground = np.clip((rgb - (1.0 - coverage) * 255.0) / coverage, 0, 255)
    return foreground, alpha


def orange_coverage(rgb: np.ndarray) -> np.ndarray:
    """Mascara suave del naranja original."""
    maximum = np.maximum(rgb.max(axis=2), 1.0)
    saturation = (rgb.max(axis=2) - rgb.min(axis=2)) / maximum
    hue_ok = (
        (rgb[..., 0] > rgb[..., 1] * 1.22)
        & (rgb[..., 1] > rgb[..., 2] * 1.08)
        & (rgb[..., 0] > 120)
    )
    return np.clip((saturation - 0.14) / 0.28, 0, 1) * hue_ok.astype(float)


def orange_color(rgb: np.ndarray) -> np.ndarray:
    coverage = orange_coverage(rgb)
    region = np.zeros(coverage.shape, dtype=bool)
    region[MOTOS_TOP:MOTOS_BOTTOM] = True
    pixels = rgb[region & (coverage > 0.95)]
    return np.median(pixels, axis=0)


def invert_for_dark(rgb: np.ndarray) -> np.ndarray:
    """Invierte tinta negra/blanca, deja el naranja y respeta las proporciones."""
    luminance = (
        0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    )
    inverted = 255.0 - luminance
    neutral = BLACK + (WHITE - BLACK) * (inverted / 255.0)[..., None]
    orange = orange_coverage(rgb)[..., None]
    return np.clip(neutral * (1.0 - orange) + rgb * orange, 0, 255).astype(np.uint8)


def dark_icon_layer(source_rgb: np.ndarray, foreground: np.ndarray, alpha: np.ndarray) -> Image.Image:
    """Isotipo invertido sin los huecos blancos internos (evita zonas negras).

    En el original esos huecos son blanco del papel: en la versión oscura deben
    ser transparencia para que se vea el fondo, no tinta negra.
    """
    inverted = invert_for_dark(foreground)
    spread = source_rgb.max(axis=2) - source_rgb.min(axis=2)
    paper = (source_rgb.mean(axis=2) > 198) & (spread < 44)
    clean_alpha = alpha.copy()
    clean_alpha[paper] = 0.0
    clean_alpha = ndi.gaussian_filter(clean_alpha, 0.6)
    return Image.fromarray(
        np.dstack([inverted, np.clip(clean_alpha, 0, 255).astype(np.uint8)]), "RGBA"
    )


def letters_alpha(rgb: np.ndarray) -> np.ndarray:
    """Aísla el texto "ZAVADIVKER" de la franja negra, sin la franja.

    Las letras son blanco sobre negro: su luminancia es la cobertura. Sólo se
    conserva la vecindad de los componentes blancos interiores detectados.
    """
    luminance = (
        0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    )
    # Sólo la franja de "ZAVADIVKER": el bloque naranja de "MOTOS" empieza en
    # MOTOS_TOP y tiene luminancia parecida, hay que excluirlo explícitamente.
    band = np.zeros(rgb.shape[:2], dtype=bool)
    band[BAND_TOP:MOTOS_TOP] = True
    bright = (luminance > 95) & band

    labels, _ = ndi.label(bright, structure=np.ones((3, 3), dtype=np.uint8))
    border_ids = np.unique(
        np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])
    )
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    keep = (sizes > 40) & ~np.isin(np.arange(len(sizes)), border_ids)
    solid = keep[labels]

    # Tinta plana: todo el trazo queda opaco y se suaviza sólo el contorno. Así
    # la base de las letras no se ve gris/negra sobre el fondo del navbar.
    alpha = ndi.gaussian_filter(solid.astype(float), 0.45)
    return np.clip(alpha, 0.0, 1.0)


def motos_alpha(rgb: np.ndarray) -> np.ndarray:
    """Aísla "MOTOS" y sus líneas de velocidad del bloque naranja inferior."""
    region = np.zeros(rgb.shape[:2], dtype=float)
    region[MOTOS_TOP:MOTOS_BOTTOM] = 1.0
    return orange_coverage(rgb) * region


def solid_layer(alpha: np.ndarray, color: np.ndarray) -> Image.Image:
    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., :3] = np.clip(color, 0, 255).astype(np.uint8)
    rgba[..., 3] = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def tight_crop(image: Image.Image, padding: int = 0) -> Image.Image:
    bbox = image.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bbox:
        return image
    left, top, right, bottom = bbox
    return image.crop(
        (
            max(0, left - padding),
            max(0, top - padding),
            min(image.width, right + padding),
            min(image.height, bottom + padding),
        )
    )


def resize_width(image: Image.Image, width: int) -> Image.Image:
    height = max(1, round(image.height * width / image.width))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def resize_height(image: Image.Image, height: int) -> Image.Image:
    width = max(1, round(image.width * height / image.height))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def compose(icon: Image.Image | None, letters: Image.Image, motos: Image.Image) -> Image.Image:
    """Compone el wordmark sobre el isotipo opcional, sin fondos rectangulares."""
    letters = resize_width(tight_crop(letters), WORD_WIDTH)
    motos = resize_width(tight_crop(motos), WORD_WIDTH)
    text_height = letters.height + WORD_GAP + motos.height

    if icon is not None:
        icon = resize_height(tight_crop(icon, 8), text_height)
        gap_x = LOCKUP_GAP
        icon_width = icon.width
    else:
        gap_x = 0
        icon_width = 0

    canvas = Image.new(
        "RGBA", (PAD * 2 + icon_width + gap_x + letters.width, text_height + PAD * 2),
        (0, 0, 0, 0),
    )
    x = PAD
    if icon is not None:
        canvas.paste(icon, (x, PAD), icon)
        x += icon_width + gap_x
    canvas.paste(letters, (x, PAD), letters)
    canvas.paste(motos, (x, PAD + letters.height + WORD_GAP), motos)
    return canvas


def square_icon(image: Image.Image, size: int = 512) -> Image.Image:
    icon = tight_crop(image, 8)
    icon.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(icon, ((size - icon.width) // 2, (size - icon.height) // 2), icon)
    return canvas


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    )
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def build_og(lockup: Image.Image) -> Image.Image:
    width, height = 1200, 630
    card = Image.new("RGB", (width, height), (7, 8, 10))
    draw = ImageDraw.Draw(card)
    draw.rectangle((0, 0, 9, height), fill=(244, 91, 33))
    draw.line((64, 96, 1136, 96), fill=(244, 91, 33), width=3)

    mark = lockup.copy()
    mark.thumbnail((920, 920), Image.Resampling.LANCZOS)
    card.paste(mark, ((width - mark.width) // 2, 150), mark)

    draw.text(
        (width // 2, 400),
        "ENDURO  /  OFF-ROAD  /  MULTIMARCA",
        font=load_font(30),
        fill=(246, 245, 242),
        anchor="mm",
    )
    draw.line((width // 2 - 90, 452, width // 2 + 90, 452), fill=(244, 91, 33), width=3)
    draw.text(
        (width // 2, 520),
        "MOTOS 0 KM  ·  USADAS  ·  TUCUMÁN",
        font=load_font(22),
        fill=(160, 158, 154),
        anchor="mm",
    )
    return card


def build_z_mark(letters: Image.Image, motos: Image.Image, size: int) -> Image.Image:
    """Icono cuadrado: la "Z" del wordmark + una línea del bloque naranja."""
    base = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(base)
    radius = round(size * 0.20)
    draw.rounded_rectangle((1, 1, size - 2, size - 2), radius=radius, fill=(7, 8, 10, 255))

    # La "Z" original ocupa approx. x=95..184, y=765..816 en la franja.
    z = letters.crop((90, 758, 186, 824))
    z = tight_crop(z, 2)
    inner = int(size * 0.60)
    z.thumbnail((inner, inner), Image.Resampling.LANCZOS)

    line = tight_crop(motos.crop((70, 850, 969, 861)))
    line = line.resize((max(8, round(z.width * 0.78)), max(3, round(size * 0.055))), Image.Resampling.LANCZOS)

    total_h = z.height + max(6, round(size * 0.07)) + line.height
    top = (size - total_h) // 2
    base.paste(z, ((size - z.width) // 2, top), z)
    base.paste(line, ((size - line.width) // 2, top + z.height + max(6, round(size * 0.07))), line)
    return base


def save(image: Image.Image, path: Path) -> None:
    image.save(path, optimize=True)
    print(f"{path.relative_to(ROOT)}  {image.width}x{image.height}")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGB")
    (OUT_DIR / "zavadivker.jpeg").write_bytes(SOURCE.read_bytes())
    rgb = np.asarray(source, dtype=np.float32)

    foreground, alpha = extract_foreground(source)
    light_full = Image.fromarray(
        np.dstack([np.clip(foreground, 0, 255).astype(np.uint8), alpha.astype(np.uint8)]), "RGBA"
    )
    dark_full = Image.fromarray(
        np.dstack([invert_for_dark(foreground), alpha.astype(np.uint8)]), "RGBA"
    )
    save(tight_crop(light_full), OUT_DIR / "zavadivker-light.png")
    save(tight_crop(dark_full), OUT_DIR / "zavadivker-dark.png")

    light_icon_full = light_full.crop((0, 0, light_full.width, ICON_BOTTOM))
    dark_icon_full = dark_icon_layer(rgb, foreground, alpha)
    dark_icon_crop = dark_icon_full.crop((0, 0, dark_icon_full.width, ICON_BOTTOM))
    icon_light = square_icon(light_icon_full)
    icon_dark = square_icon(dark_icon_crop)
    save(icon_light, OUT_DIR / "zavadivker-icon-light.png")
    save(icon_dark, OUT_DIR / "zavadivker-icon-dark.png")

    letters_alpha_mask = letters_alpha(rgb)
    motos_alpha_mask = motos_alpha(rgb)
    accent = orange_color(rgb)

    letters_light = solid_layer(letters_alpha_mask, BLACK)
    letters_dark = solid_layer(letters_alpha_mask, WHITE)
    motos = solid_layer(motos_alpha_mask, accent)

    for suffix, icon, letters in (
        ("light", light_icon_full, letters_light),
        ("dark", dark_icon_crop, letters_dark),
    ):
        save(compose(icon, letters, motos), OUT_DIR / f"zavadivker-lockup-{suffix}.png")
        save(compose(None, letters, motos), OUT_DIR / f"zavadivker-compact-{suffix}.png")

    # Variante de cabecera: "ZAVADIVKER" en tinta plana (negra sobre claro,
    # blanca sobre oscuro) y "MOTOS" con sus líneas siempre en el naranja
    # original, que es el acento de la marca.
    save(
        compose(light_icon_full, letters_light, motos),
        OUT_DIR / "zavadivker-header-light.png",
    )
    header_dark = compose(dark_icon_crop, letters_dark, motos)
    save(header_dark, OUT_DIR / "zavadivker-header-dark.png")

    save(build_og(header_dark), OUT_DIR / "zavadivker-og.png")
    save(build_z_mark(letters_dark, motos, 64), PUBLIC_DIR / "favicon.png")
    save(build_z_mark(letters_dark, motos, 180), PUBLIC_DIR / "apple-touch-icon.png")


if __name__ == "__main__":
    main()
