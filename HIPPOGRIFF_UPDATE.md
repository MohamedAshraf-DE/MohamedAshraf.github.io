# Castle and Hippogriff scene — 2026-09-30

The floating island carries an original miniature Gothic academy and a village:
four animated old windmills and eight cottages, distributed around the four text
viewpoints. Paths, flowers, benches, chimney smoke and warm night windows add life.
The castle and village reuse the project's existing CC0 Poly Haven material scans.

The active Hippogriff and Harry-inspired rider are original procedural geometry.
The user-selected LunaEagle Sketchfab model was reviewed as a reference but has not
been downloaded or included; its download requires sign-in. This iteration keeps
the original model that the user approved. If that external asset is added later,
its license, skeleton and orientation must be reviewed before integrating it.

## Motion and navigation

- Restored the original dragon's exact eight-point route, arc-length sampling,
  72-second lap and mobile X projection; enlarged the Hippogriff approximately 21%.
- Smooth banking, wing strokes/gliding, delayed rider lean, cape and tail movement.
- White day / charcoal night coat; hand-held bronze lantern lights only at night,
  with subtle sway and flicker. Motion is an animation approximation, not CFD.
- Masked lake ripples/reflections and drifting clouds preserve the static landscape.
- Four windmills rotate; reduced-motion preferences and hidden tabs pause or reduce
  ambient motion. The canvas stops rendering while the page is hidden.
- A 44 px Home icon stays at bottom-right on every inner page, including Recruiter.
  Mobile menu also includes Home; returning resets scroll to the top.

## Mobile and loading

- Smaller textures in public/scene-assets/mobile, reproduced by
  scripts/optimize-scene-assets.py. Eight assets total 526,458 bytes versus
  2,609,810 bytes for the originals: 79.8% smaller. Desktop originals are retained.
- Compact castle/creature geometry, fewer background vertices, simplified terrain,
  reduced foliage/rocks and 1x pixel ratio lower the mobile rendering budget.
- Removed the unused 1.6 MB dragon preload. Pages load separately; the Hippogriff
  and village modules load after the terrain/castle's first ready render.
- A lightweight background and progress indicator provide feedback during loading.
- Portrait lighting controls and Recruiter button are separated, with safe-area
  spacing; horizontal island dragging allows vertical page scrolling.

## Validation

node --test tests/hippogriff-flight.test.mjs: seven tests pass, covering frame-rate
independence, loop continuity, legacy route/timing, village layout, bounded motion,
finite geometry and the lower mobile triangle budget with all material parts kept.

Targeted ESLint and production build pass. The build retains a large Three.js
shared chunk warning. Repository-wide lint has unrelated existing findings in
LoginCharacters.jsx and Services.jsx.

Browser review: desktop day/night, lantern close-up, a 390 x 844 portrait iframe,
mobile Certificates navigation and fixed Home return. Local development first-ready
samples were about 1.1–1.5 seconds; this is not a cold mobile network benchmark.
The compact preview reported about 101k triangles at 1x DPR. QA HTML and screenshots
are ignored in .scene-checkpoints and are not part of the build.

No deployment or Git commit was made for these changes.
