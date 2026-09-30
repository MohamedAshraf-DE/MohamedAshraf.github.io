# Cinematic fantasy island — local review

> Historical report for the earlier preserved version. The current landscape/dragon revision is documented in [CINEMATIC_UPGRADE.md](CINEMATIC_UPGRADE.md). Aircraft and the visible procedural castle described below are no longer mounted.

Completed on 30 September 2026 against the existing working tree. The floating island, house, portfolio content, routes, original flying creature, music and Recruiter Mode remain. No commit, push or deployment was performed.

The user's latest clarification overrides the pasted brief: **Waterfall, Places and Nature sounds stay removed**, alongside Original/Show Places controls. Original music remains off on startup. Home has no “Preparing your island” message or entrance delay.

## Scene changes

- A faceted teal crystal intersects the island underside, with a restrained aura, slowly floating stone fragments, fine bronze rings and drifting particles.
- An original 3D world surrounds the island: two asymmetric castle precincts, towers, halls, cliffside villages, forests, cliffs, mountain layers and a valley. The island remains the main subject.
- Day, Sunset and Night smoothly blend sky, fog, clouds, lighting, window glow, moon, stars and island details. Day retains blue sky; sunset combines a warm horizon and purple distance; night contrasts cool moonlight with warm windows.
- A newly authored vintage aircraft has a tapered fuselage, shaped wings/tail, glass canopy, engine cowling, panel details, struts, wheels and spinning propeller with a faint blur disc. Tiny red port, green starboard and white tail lights become clearer at night, with warm cockpit glow.
- A closed 3D spline gives the aircraft changing altitude/distance, pitch, banking and passes in front of and behind the island. The normal loop takes approximately 74 seconds.
- Shader wind keeps trunks stationary and varies the movement of grass/leaves. Lanterns, glowing house windows and fireflies remain subtle. The creature retains its restored original size, materials and foreground trajectory.

## Depth, architecture and materials

The castle, cliffs and mountains are geometry at different world-space distances. Independently placed cloud layers, fog and a gently damped camera offset produce parallax between the island and distant world. Touch exploration avoids pointer parallax. Mountain geometry now extends into the valley below the camera, removing a rectangular edge found during mobile inspection. A proposed viaduct was omitted after review because its supports cluttered the valley below the crystal.

Varied cylindrical towers, conical spires, buttresses, arches and window rhythms create an original asymmetric composition. Several references informed silhouette, scale and warm/cool contrast; no recognizable Hogwarts layout or game asset was reproduced.

Major surfaces use PBR roughness/metalness, with procedural stone courses, weathering, paint grain, rocky-ground variation and canopy shading. Glass uses restrained clearcoat; the crystal uses facet colors and emissive modulation. A generated small cube environment provides reflections without an HDRI download. Soft shadows, ACES tone mapping and a light vignette complete the image. No expensive volumetric simulation, full-screen bloom or depth-of-field was added.

## Files changed or added

Some files were created in the earlier island pass and remain untracked. This list describes the complete reviewable working tree.

| Files | Purpose |
| --- | --- |
| src/pages/Home.jsx; home-scene.css | Scene composition, adaptive sizing/quality, three lighting controls, separated drag/Recruiter UI. |
| src/context/ThemeContext.jsx; new theme.js | Shared theme/environment preference. Sunset uses light UI; original theme toggle returns to Day/Night. |
| new src/models/MagicSuspension.jsx | Crystal, aura, instanced fragments, rings and particles. |
| new src/models/FantasyWorld.jsx; fantasyWorldGeometry.js | Merged original world geometry, weathered masonry, lit windows and camera parallax. |
| new src/models/CloudLayers.jsx; SkyEnvironment.jsx | Procedural cloud layers and generated reflection environment. |
| new src/models/Atmosphere.jsx; SceneLighting.jsx; NightStars.jsx | Sky, fog, moon, varied stars and smooth shared illumination. |
| src/models/Plane.jsx; new aircraftGeometry.js | Procedural aircraft, PBR surfaces, navigation lights, propeller and spline flight. |
| src/models/Island.jsx; NatureDetails.jsx; nature.js; wind.js; IslandLife.jsx; islandMotion.js | Cached detailed island, foliage wind, night life, material variation and damped rotation/inertia. Integrate crystal and retain deletions. |
| src/models/Bird.jsx; useFlightScene.js | Original creature appearance, independent preload and cloned animation bindings/material ownership. |
| new src/models/SceneDiagnostics.jsx | Development-only FPS/render/transition measurements; no diagnostic UI. |
| src/components/Navbar.jsx; HomeInfo.jsx; Loader.jsx | Tablet-safe navigation, stationary dropdown links, crisp Egyptian flag and loading presentation on other routes. |
| src/pages/RecruiterMode.jsx; About.jsx | Small-screen return-to-3D link, context import adjustment and unused-variable cleanup. |
| src/App.jsx; index.html | Home skips route fade; music downloads on request; independent island/creature preloads; obsolete aircraft preload removed. |
| .gitignore; eslint.config.js | Ignore local checkpoint in Git/lint. |
| SCENE_IMPROVEMENTS.md; THIRD_PARTY_NOTICES.md | Review report and flag license notice. |

## Assets, sources and licenses

No new downloaded model, texture, HDRI, background screenshot, audio file or dependency was added. World/aircraft/crystal geometry, shaders and reflection environment are authored in source. Existing island/creature GLBs and existing attribution remain. The old aircraft GLB remains on disk/checkpoint but is no longer used by Home.

The Egyptian SVG flag comes from the already installed [flag-icons package](https://github.com/lipis/flag-icons), flags/4x3/eg.svg, under MIT. THIRD_PARTY_NOTICES.md reproduces its notice.

Visual research included several daytime/nighttime castles, cliffs, floating-island and crystal compositions, including the [official Hogwarts Legacy media gallery](https://www.hogwartslegacy.com/en-us/media). These informed design principles only. Navigation-light placement follows the [FAA Airplane Flying Handbook, Chapter 11](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/12_afh_ch11.pdf).

## Performance and loading

- Distant world: 8 merged material groups, approximately 13,696 triangles full / 7,946 compact. Aircraft: 3 merged body groups, approximately 2,832 triangles, plus small separate glass/propeller/light details.
- Instancing handles leaves, grass, fragments and clouds. Leaves use simpler geometry and reduced density. Castle windows are emissive; aircraft/crystal add no dynamic lights.
- Shared uniform/material blending keeps lights mounted, avoiding shader recompilation on theme changes. Animation uses refs, frame callbacks and shaders instead of per-frame React state.
- Full quality: up to 1.5 DPR, 2048px shadows. Portrait/tablet: up to 1.25 DPR. Compact: 1 DPR, 1024px shadows, fewer leaves/grass/particles/clouds, simpler distant geometry and no aircraft shadow. Sustained low FPS selects compact quality without oscillation.
- Island and creature preload together under independent Suspense boundaries. The procedural world/aircraft do not wait on GLBs. Home has no readiness gates; processed island geometry is cached across route visits.
- Removing the old aircraft download saves approximately 1.47 MB. Island + creature total about 1.99 MB. New procedural assets add code rather than external requests. The original ~13.37 MB music uses preload=none.

### Local observations

Preview/emulation measurements are not guarantees for physical laptops or phones. DPR and viewport affect the results.

| Sample | FPS | Draw calls | Rendered triangles* | DPR |
| --- | ---: | ---: | ---: | ---: |
| Before fantasy upgrade, laptop-size preview | 39 | 96 | 940,812 | 1.25 |
| Upgraded settled samples at same DPR | 65–69 | 77 | ~378,000–380,000 | 1.25 |
| Desktop preview with viewport override | 105 | 77 | 381,603 | 1.0 |
| Settled compact preview | 109–120 | ~68–76 | ~267,000–277,000 | 1.0 |

*Includes shadow passes; counts vary with the aircraft/frustum and differ from asset geometry counts. Samples were collected throughout the pass; the final removal of the viaduct further reduced geometry by 2,028 full / 1,260 compact triangles without changing the eight world material groups.

A compact resize/interaction sample reached 46 FPS. Earlier transitions had occasional 79–98ms frame outliers during other UI/viewport activity. Final isolated transitions recorded maximum frames of 16–23ms with 33 shader programs before/after; a compact transition stayed at 32. Mode changes no longer require new lighting shader programs, but occasional device/interaction hitches remain possible.

## Validation

- Production build passed. ESLint passed for all changed/new JavaScript files. Git diff whitespace check passed.
- Existing build warnings remain: large main chunk (~458 KB gzipped) and outdated Browserslist data. Unrelated pre-existing lint issues in LoginCharacters.jsx remain; no full-repository lint pass is claimed.
- Visually reviewed Day, Sunset and Night, original creature, crystal connection, aircraft and world depth. Original top theme control correctly exits Sunset into Night.
- Reviewed desktop 1440×900, laptop 1270×714, portrait tablet 820×1180 and mobile 390×844. No horizontal page overflow found. Portrait sizing preserves house, crystal and distant world. Hint/Recruiter and lighting controls remain separate.
- Verified pointer/touch dragging, island Learn More → About, and About/Projects/Contact/Certificates/Services navigation. Mobile dropdown links no longer move while clicked.
- Verified Recruiter Mode and return to 3D. Added a small-screen return link; content remains unchanged and Home's 3D scene unmounts on that route.
- Original music starts/stops and finishes off. No contact form was submitted. CV returned HTTP 200 with application/pdf.
- Geometry/path checks found finite buffers, closed flight endpoints/tangents and gradual sampled heading changes at the loop boundary.
- Browser review showed no new warning/error logs. Removed controls/loading text remain absent.

## Checkpoint and later opportunities

.scene-checkpoints/before-fantasy/ preserves source/configuration from immediately before the major fantasy upgrade, including already accepted island improvements, tracked diff and Git status. It is ignored, is not a commit and does not duplicate unchanged binaries. Its README explains selective restoration.

Separate future work: route-level code splitting; compression/lazy loading of large existing recruiter/project images; offline GLB compression; real low-power phone testing; additional bespoke stone textures or richer distant architecture after performance review. No GitHub publication has occurred.
