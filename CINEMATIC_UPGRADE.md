# Cinematic landscape revision — 30 September 2026

This is the current local review version. It supersedes the procedural castle/aircraft version described in SCENE_IMPROVEMENTS.md. No commit, push or deployment was performed.

## Preservation

- The previously approved site is saved under `.scene-checkpoints/approved-fantasy-2026-09-30/` with restoration instructions.
- The procedural academy version before the user's graphics correction is saved under `.scene-checkpoints/cinematic-procedural-2026-09-30/`.
- The original floating island, drag/inertia, stage-linked portfolio content, navigation, routes, CV, Recruiter Mode and music remain.
- The aircraft is no longer mounted. Waterfall, Places, Nature sounds, Original and Show Places remain removed, following the user's explicit clarification.

## Visual research

The supplied Hogwarts Legacy aerial screenshot, the [official media gallery](https://www.hogwartslegacy.com/en-us/media), additional daylight/lakeside and moonlit castle image searches, and the [Avalanche environment interview](https://www.unrealengine.com/developer-interviews/why-avalanche-worked-to-deliver-a-hogwarts-game-with-soul) informed the composition. The important principles were coherent terrain and architecture, fine foliage, weathered surfaces, strong distant atmospheric perspective, and warm windows against blue moonlight.

No Hogwarts game files or screenshots are bundled in the website. The landscape and foliage/dragon textures were generated for this project using the built-in image generation tool. The final landscape is 1672 × 941, not a native 4K render. Material scans are CC0 Poly Haven assets; see THIRD_PARTY_NOTICES.md.

## What changed

- Replaced the visible procedural academy with a detailed original castle/lake/mountain landscape. Matching day and moonlit night images blend using the existing shared transition uniforms; sunset uses a warm intermediate grade.
- This distant environment is **2.5D camera projection onto a relief mesh**, not an explorable fully modeled castle. Foreground cliffs, castle, distance and sky occupy different depths. Restrained pointer camera movement produces parallax without exposing the projection's sides. The lake has a subtle local ripple; separate world-space mist remains animated.
- The island and flying creature remain actual 3D geometry. The island now uses scanned slate, masonry, rocky terrain and rock color detail, derivative bump detail and canopy occlusion. Twenty-two instanced, irregular rock masses and a scanned normal map break up its smooth underside.
- Replaced octahedral tree leaves with alpha-tested botanical branch cards, using an original transparent foliage texture. Random orientations and wind retain volume when the island rotates, with a matching alpha-tested shadow material.
- Original dragon/rider GLB: 37,160 triangles, seven-bone animated rig, flapping wings, tail and cloak motion. A closed 72-second spline supplies altitude changes, tangent-aligned heading, damped banking and foreground/background passes. The dragon has a larger silhouette and a detailed muted reptile-skin texture. The rider uses original dark academy clothing, saddle/reins and an animated cloak.
- Sun/moon direction is coordinated with the landscape. Night fill was increased, with one inexpensive unshadowed frontal fill light, to keep the island and close dragon passes readable. Warm window/lantern light, soft shadows, ACES on 3D objects and restrained crystal effects remain.

## Main files

| File | Purpose |
| --- | --- |
| `src/models/CinematicLandscape.jsx` | Relief projection, day/night blend, lake shimmer and portrait framing |
| `src/models/WorldCamera.jsx` | Independent smooth camera parallax; avoids importing the unused castle worker |
| `src/models/nature.js` | Scanned materials, roof/terrain/wall masks and bump shading |
| `src/models/NatureDetails.jsx` | Detailed foliage cards, wind and cutout shadows |
| `src/models/GeologicalBase.jsx` | Instanced textured rock masses |
| `src/models/Island.jsx` | Independent loading of geological detail without blocking the island |
| `src/models/DragonRider.jsx` | Original creature/rider integration, flight path and upgraded skin |
| `src/models/SceneLighting.jsx` | Coordinated sunlight/moonlight and readable night fill |
| `src/pages/Home.jsx` | Scene assembly, preserved controls and independent suspense boundaries |
| `public/scene-assets/academy/` | Generated day/night WebP landscape assets |
| `public/scene-assets/materials/` | Optimized scan and generated WebP textures |
| `.scene-sources/IMAGE_PROMPTS.md` | Generation prompts, source outputs and saved asset paths |

The unused procedural world source is retained for recovery. Its background geometry is not mounted in this revision.

## Performance and limits

The nine new image assets total about 3.07 MB. Both landscape images together are under 0.88 MB. The 1.62 MB creature GLB and 0.36 MB island load independently. No new NPM dependency, loading screen, fixed entrance delay, full-screen bloom or heavy volumetric simulation was added. The downloaded fort model kit and unused source maps are archived outside `public`; only the required textures ship.

A clean desktop development preview at 1270 × 720 measured approximately 50 FPS, 65 draw calls, 203,915 rendered triangles including shadow passes, and DPR 1.25. These are one-machine samples, not a universal performance guarantee. Adaptive DPR, reduced foliage and shadow resolution remain available. A measured day/night transition kept the shader count at 30; its slowest sampled frame was 62 ms, so occasional frame spikes are still possible.

This is a substantial improvement in distant environmental fidelity, but **it is not equivalent to Hogwarts Legacy's AAA renderer or asset quality**. The foreground house retains its original stylized silhouette. The dragon/rider could still benefit from a professionally sculpted and baked replacement, higher-detail animation and better close-up topology. The landscape projection supports the current restrained camera and island rotation; free flight around the castle would require full 3D architecture, terrain, LODs and a different streaming budget.

## Validation

- Production build passed; Vite reports the existing large application chunk and outdated Browserslist database warnings.
- ESLint passed for the scene files changed in this revision.
- Clean development preview produced no console errors or warnings. Production preview was also checked visually.
- Day, Sunset and Night were inspected. Day/night blends use the same shader programs rather than remounting lights/materials.
- Desktop and 390 × 844 portrait views were inspected. Portrait canvas width was 381 px with the scrollbar, equal to document content width; no horizontal overflow.
- Pointer dragging changed the island orientation and associated hero stage. Recruiter Mode and the return to 3D Mode worked. Music toggled from its off icon to on and was stopped after the check.
- About, Projects, Certificates, Services and Contact were visited during this work; the contact form was not submitted. The production CV endpoint returned HTTP 200 with `application/pdf`.
- The user's deleted scene features have not been reintroduced. No remote publication was performed.
