import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Original stand-in, not the downloadable LunaEagle asset. Separate anatomical
// groups make the flight rig reusable when the licensed source file is supplied.
export function createHippogriffGeometry() {
    const pieces = {};
    let piece = 'body';
    const matrix = new THREE.Object3D();
    function add(material, g, p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0]) {
        matrix.position.fromArray(p); matrix.scale.fromArray(s); matrix.rotation.set(...r); matrix.updateMatrix();
        g.applyMatrix4(matrix.matrix);
        const geo = g.index ? g.toNonIndexed() : g;
        if (geo !== g) g.dispose();
        const key = `${piece}:${material}`;
        (pieces[key] ||= []).push(geo);
    }
    const oval = (mat, p, s, r) => add(mat, new THREE.SphereGeometry(1, 20, 12), p, s, r);
    function tube(mat, points, radii, segments = 20) {
        const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
        const g = new THREE.TubeGeometry(curve, segments, 1, 8, false);
        const pos = g.attributes.position;
        for (let j = 0; j <= segments; j++) {
            const t = j / segments, center = curve.getPointAt(t);
            const k = t * (radii.length - 1), index = Math.min(radii.length - 2, Math.floor(k));
            const radius = MathUtilsLerp(radii[index], radii[index + 1], k - index);
            for (let a = 0; a <= 8; a++) {
                const n = j * 9 + a;
                pos.setXYZ(n, center.x + (pos.getX(n) - center.x) * radius,
                    center.y + (pos.getY(n) - center.y) * radius, center.z + (pos.getZ(n) - center.z) * radius);
            }
        }
        g.computeVertexNormals(); add(mat, g);
    }
    function feather(mat, start, end, width) {
        const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
        const direction = b.clone().sub(a), across = new THREE.Vector3(direction.z, 0, -direction.x).normalize();
        const positions = [], uvs = [], indices = [];
        for (let j = 0; j <= 8; j++) {
            const t = j / 8, center = a.clone().lerp(b, t);
            center.y += Math.sin(t * Math.PI) * .065;
            const w = Math.pow(Math.sin(Math.PI * Math.pow(t, .65)), .7) * width;
            for (const side of [-1, 0, 1]) {
                const p = center.clone().addScaledVector(across, side * w);
                p.y += side === 0 ? .025 : -.012;
                positions.push(...p.toArray()); uvs.push((side + 1) / 2, t);
            }
            if (j < 8) for (let k = 0; k < 2; k++) { const n = j * 3 + k; indices.push(n, n + 3, n + 1, n + 1, n + 3, n + 4); }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        g.setIndex(indices); g.computeVertexNormals(); add(mat, g);
    }
    // Equine hindquarters and a broad feathered eagle chest.
    oval('coat', [0, .02, -.55], [.67, .7, 1.55]);
    oval('feathers', [0, .23, .72], [.76, .85, 1.02], [.2, 0, 0]);
    tube('feathers', [[0, .38, .95], [0, .92, 1.5], [0, 1.4, 1.83]], [.57, .44, .31]);
    for (let ring = 0; ring < 5; ring++) for (let j = 0; j < 14; j++) {
        const a = j / 14 * Math.PI * 2, y = .22 + ring * .19, z = 1.05 + ring * .11, radius = .6 - ring * .05;
        feather(j % 4 === 0 ? 'secondary' : 'feathers', [Math.cos(a) * radius, y + Math.sin(a) * radius, z],
            [Math.cos(a) * (radius + .1), y + Math.sin(a) * (radius + .1) - .18, z - .55], .13);
    }
    piece = 'head';
    oval('feathers', [0, .05, .14], [.33, .38, .51]);
    oval('secondary', [0, .15, .27], [.32, .2, .25]);
    tube('beak', [[0, -.03, .46], [0, -.07, .74], [0, -.3, .87]], [.21, .14, .014], 14);
    for (const side of [-1, 1]) {
        oval('eye', [side * .29, .09, .31], [.047, .076, .085]);
        oval('pupil', [side * .328, .09, .34], [.014, .045, .045]);
        tube('secondary', [[side * .19, .24, .43], [side * .31, .19, .29], [side * .3, .17, .12]], [.055, .055, .012], 10);
        for (let i = 0; i < 4; i++) feather('feathers', [side * .13, .28, -.1], [side * (.21 + i * .035), .24 + i * .07, -.59], .07);
    }
    // Wing pivots: shoulders -> wrists -> long primary feathers. No membrane.
    for (const side of [-1, 1]) {
        piece = side < 0 ? 'wingLeft' : 'wingRight';
        tube('feathers', [[0, 0, 0], [side * 1.25, .08, .17], [side * 2.35, 0, -.12]], [.26, .22, .13]);
        for (let row = 0; row < 3; row++) for (let i = 0; i < 17; i++) {
            const x = .07 + i * .138, z = .12 - row * .21;
            feather(row === 2 ? 'secondary' : 'feathers', [side * x, .11 - row * .025, z],
                [side * (x + .19), -.025, z - .66 - row * .13], .145);
        }
        piece = side < 0 ? 'tipLeft' : 'tipRight';
        tube('feathers', [[0, 0, 0], [side * 1.1, .01, -.31], [side * 1.92, -.06, -.64]], [.14, .11, .035]);
        for (let i = 0; i < 12; i++) {
            const t = i / 11;
            feather(i % 3 === 0 ? 'secondary' : 'feathers', [side * t * 1.65, .025, -.25 * t],
                [side * (1 + t * 2.15), -.08 - t * .12, -1.6 + .37 * t], .19 - t * .065);
        }
        for (let i = 0; i < 12; i++) feather('feathers', [side * i * .15, .11, -.13 * i / 12],
            [side * (.4 + i * .16), .045, -.85 - i * .03], .14);
        piece = side < 0 ? 'hindLeft' : 'hindRight';
        oval('coat', [0, -.13, 0], [.3, .55, .45], [-.45, 0, 0]);
        tube('coat', [[0, -.2, 0], [side * .06, -.87, -.43], [side * .03, -1.23, -.17]], [.23, .12, .09]);
        oval('hoof', [side * .03, -1.31, -.08], [.14, .18, .23]);
        piece = side < 0 ? 'foreLeft' : 'foreRight';
        tube('feathers', [[0, 0, 0], [side * .12, -.55, -.22], [side * .08, -.83, -.45]], [.22, .16, .09]);
        tube('beak', [[side * .08, -.83, -.45], [side * .07, -1.05, -.25], [side * .07, -1.08, .12]], [.09, .07, .055]);
        for (let i = 0; i < 3; i++) tube('hoof', [[(i - 1) * .105, -1.08, .02], [(i - 1) * .14, -1.18, .27], [(i - 1) * .14, -1.26, .2]], [.042, .024, .003], 10);
    }
    piece = 'tail';
    tube('coat', [[0, 0, 0], [0, -.21, -.55], [0, -.34, -1.15]], [.14, .12, .035]);
    for (let i = 0; i < 23; i++) {
        const a = i * 2.4;
        tube(i % 3 ? 'feathers' : 'secondary', [[0, -.1, -.36], [Math.cos(a) * .17, -.24 + Math.sin(a) * .1, -1.12], [Math.cos(a) * .32, -.43 + Math.sin(a) * .16, -2.12 - (i % 4) * .12]], [.043, .036, .003], 14);
    }
    piece = 'saddle';
    oval('leather', [0, .7, -.38], [.53, .1, .67]);
    for (const side of [-1, 1]) tube('leather', [[side * .46, .7, -.5], [side * .68, -.05, -.6], [side * .3, -.61, -.58]], [.035, .035, .035]);
    // Harry: round spectacles, tousled black hair, black robes and red/gold scarf.
    piece = 'riderLegs';
    for (const side of [-1, 1]) {
        tube('robe', [[side * .17, .15, 0], [side * .48, -.12, .27], [side * .63, -.66, .02]], [.17, .15, .09]);
        oval('leather', [side * .64, -.72, .16], [.12, .14, .23]);
    }
    piece = 'rider';
    oval('robe', [0, .43, .025], [.3, .53, .23], [.12, 0, 0]);
    oval('shirt', [0, .55, .233], [.16, .33, .03]);
    tube('skin', [[0, .79, .08], [0, .97, .13]], [.12, .13]);
    oval('skin', [0, 1.16, .16], [.205, .255, .19]);
    oval('hair', [0, 1.32, .1], [.221, .145, .2]);
    for (let i = 0; i < 9; i++) oval('hair', [(i % 3 - 1) * .13, 1.34 + (i % 2) * .045, .19 - Math.floor(i / 3) * .13], [.1, .1, .1], [.1, .2, i * .8]);
    oval('skin', [0, 1.14, .347], [.037, .05, .05]);
    for (const side of [-1, 1]) {
        add('glasses', new THREE.TorusGeometry(.077, .012, 6, 16), [side * .089, 1.19, .33]);
        tube('glasses', [[side * .165, 1.19, .33], [side * .2, 1.19, .12]], [.01, .01], 4);
        oval('pupil', [side * .084, 1.187, .332], [.023, .026, .012]);
        tube('robe', [[side * .26, .72, .08], [side * .37, .34, .35], side > 0 ? [.43, .3, .73] : [-.27, .23, .69]], [.12, .095, .07]);
        oval('skin', side > 0 ? [.43, .29, .75] : [-.27, .22, .72], [.073, .075, .095]);
    }
    tube('glasses', [[-.018, 1.2, .34], [.018, 1.2, .34]], [.01, .01], 4);
    add('scarf', new THREE.TorusGeometry(.147, .067, 8, 20), [0, .91, .105], [1, 1, 1], [Math.PI / 2, 0, 0]);
    tube('gold', [[-.11, .92, .16], [0, .92, .245], [.11, .92, .16]], [.019, .019, .019], 10);
    piece = 'reins';
    tube('leather', [[-.27, 1.04, .49], [-.37, 1.04, 1.2], [-.29, 1.32, 1.93]], [.014, .014, .014], 18);
    const result = {};
    Object.entries(pieces).forEach(([key, list]) => { result[key] = mergeGeometries(list); list.forEach(g => g.dispose()); });
    return result;
}

function MathUtilsLerp(a, b, t) { return a + (b - a) * t; }
