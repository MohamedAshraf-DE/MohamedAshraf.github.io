# Egyptian flag asset notice

The Home greeting uses flags/4x3/eg.svg from the existing flag-icons dependency:
https://github.com/lipis/flag-icons

The MIT License (MIT)

Copyright (c) 2013 Panayiotis Lipiridis

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This notice does not replace existing licenses/attribution for other project
assets or dependencies.

## Poly Haven material scans — CC0

The following assets were downloaded from the official Poly Haven API/download servers and encoded as WebP for the island:

- Aerial Rocks 02 — https://polyhaven.com/a/aerial_rocks_02 — diffuse and OpenGL normal map.
- Rocky Terrain 03 — https://polyhaven.com/a/rocky_terrain_03 — diffuse map.
- Roof Slates 02 — https://polyhaven.com/a/roof_slates_02 — diffuse map.
- Modular Fort 01 — https://polyhaven.com/a/modular_fort_01 — wall diffuse map only. The model kit was researched and archived locally, not included in the active scene.

Poly Haven assets are released under CC0: https://polyhaven.com/license

## Original generated assets

The academy day/night landscape, hornbeam foliage cutout and dragon scale texture were created for this project with the built-in image generation tool. Prompts and output paths are recorded in `.scene-sources/IMAGE_PROMPTS.md`. These are generated imagery, not photographs or extracted game assets.

The Veyr dragon/rider mesh and animation were authored for this project in Blender via Higgsfield 3D Jutsu. Source: `.scene-sources/dragon_rider.py`. The webpage applies an additional generated skin texture independently of the exported GLB.

## Miniature castle and interim Hippogriff

The active home scene now uses original procedural castle and Hippogriff/rider
geometry, authored in `src/models/castleGeometry.js` and
`src/models/hippogriffGeometry.js`. The old dragon is no longer imported by Home.
The castle reuses the CC0 Poly Haven material scans credited above.

The LunaEagle Hippogriff at
https://sketchfab.com/3d-models/hippogriff-5e43823e23e14478b553dd333c083e79
was inspected as a user-selected reference. **It has not been downloaded or
included.** Download requires Sketchfab sign-in. Its listed CC Attribution
license and author credit must accompany the actual asset if it is added later.

## Mobile texture variants

The files under public/scene-assets/mobile are resized WebP derivatives of the
existing Poly Haven scans and original generated landscapes/foliage credited
above. They introduce no new external assets. Reproduction script:
scripts/optimize-scene-assets.py.
