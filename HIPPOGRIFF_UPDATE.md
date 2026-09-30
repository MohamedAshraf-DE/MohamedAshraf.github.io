# Castle and Hippogriff scene — 2026-09-30

The home island now carries an original miniature Gothic academy: Great Hall,
staircase tower, satellite spires, entrance arch, courtyard and cloister.
Its stone/slate use the project's existing Poly Haven scans; its windows glow
with the same day/sunset/night transition as the landscape. The old cottage
and fence geometry is filtered from the shared island mesh, preserving the
floating rock and outer grove.

The dragon has been replaced in the active scene with an **original procedural
Hippogriff stand-in**, with a Harry-inspired rider. This is **not the LunaEagle
Sketchfab model**, and is not a game-quality realistic character. The linked
Sketchfab page was inspected: its download opens a sign-in dialog. No source
mesh or texture was extracted from its viewer. To finish the requested asset
replacement, supply the officially downloaded GLB/glTF (including textures)
or original FBX. Its skeleton, pose, orientation and license attribution must
then be inspected before fitting the flight animation and rider to it.

Reference: https://sketchfab.com/3d-models/hippogriff-5e43823e23e14478b553dd333c083e79
Author shown on that page: LunaEagle. Listed license: CC Attribution.
The user-supplied Hogwarts Legacy clip was reviewed locally at 5 and 12 seconds.

## Motion implementation

- Arc-length orbit, speed adjustment on climbs and bank derived from curvature.
- Power strokes alternate with gliding; wrists lag behind shoulder movement.
- Spring-damped lift response and independently delayed rider lean.
- Wind-driven tail, folded legs, stabilized head and shoulder-pinned flowing cape.
- White daytime feathers / charcoal-black nighttime feathers, smoothly blended.
- Portrait orbit leaves room for the inner wing around the castle.
- Reduced-motion preference lowers travel speed, wing amplitude and gusts;
  hidden tabs pause the simulation. This is an aerodynamic animation
  approximation, not a fluid or full cloth physics solver.

## Validation

`node --test tests/hippogriff-flight.test.mjs` covers 30/60/120/144 Hz consistency,
loop continuity, castle clearance, spring bounds, gliding, stalled-frame
recovery and finite geometry buffers. Five tests pass.

The modified files pass ESLint. Repository-wide lint still reports existing
unused variables in `LoginCharacters.jsx` and `Services.jsx`, plus an existing
hook dependency warning. Those unrelated files were not changed.

Browser review included day/night, close views of both coat colors, the full
scene, and a 390 x 844 portrait iframe. Review HTML and the local reference
video are only in ignored `.scene-checkpoints/` and are not part of the build.

The pre-existing dragon asset/source remain on disk but Home no longer imports
them. Existing user edits were preserved; no deployment or Git commit was made.
