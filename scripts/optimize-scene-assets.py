"""Generate smaller WebP variants for mobile without altering desktop assets.

Requires Pillow. Run from the project root with the bundled Python runtime.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'public' / 'scene-assets'
paths = [
    'academy/day.webp', 'academy/night.webp',
    'materials/aerial_rocks_02-Diffuse.webp', 'materials/aerial_rocks_02-nor_gl.webp',
    'materials/fort-wall-diff.webp', 'materials/rocky_terrain_03-Diffuse.webp',
    'materials/roof_slates_02-Diffuse.webp', 'materials/hornbeam.webp',
]
before = after = 0
for relative in paths:
    source = root / relative
    destination = root / 'mobile' / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        size = 960 if relative.startswith('academy/') else 384 if 'hornbeam' in relative else 512
        image.thumbnail((size, size), Image.Resampling.LANCZOS)
        image.save(destination, 'WEBP', quality=78 if relative.startswith('academy/') else 76, method=6)
    before += source.stat().st_size
    after += destination.stat().st_size
    print(f'{relative}: {source.stat().st_size:,} -> {destination.stat().st_size:,} bytes')
print(f'Total mobile textures: {before:,} -> {after:,} bytes ({(1-after/before)*100:.1f}% smaller)')
