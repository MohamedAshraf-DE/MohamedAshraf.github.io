import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// One merged buffer per surface, including the many small Gothic details.
export function createCastleGeometry(compact = false) {
    const parts = { stone: [], trim: [], roof: [], recess: [], windows: [] };
    const transform = new THREE.Object3D();
    function add(kind, geometry, position, rotation = [0, 0, 0], scale = [1, 1, 1]) {
        transform.position.fromArray(position);
        transform.rotation.set(...rotation);
        transform.scale.fromArray(scale);
        transform.updateMatrix();
        geometry.applyMatrix4(transform.matrix);
        const flat = geometry.index ? geometry.toNonIndexed() : geometry;
        if (flat !== geometry) geometry.dispose();
        parts[kind].push(flat);
    }
    const box = (kind, p, s, r) => add(kind, new THREE.BoxGeometry(...s), p, r);
    const cylinder = (kind, p, top, bottom, height, sides = compact ? 12 : 24) =>
        add(kind, new THREE.CylinderGeometry(top, bottom, height, sides), p);
    const cone = (p, radius, height) => add('roof', new THREE.ConeGeometry(radius, height, compact ? 12 : 24), p);
    function pointedShape(w, h) {
        const s = new THREE.Shape();
        s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h * .64);
        s.quadraticCurveTo(w / 2, h * .84, 0, h);
        s.quadraticCurveTo(-w / 2, h * .84, -w / 2, h * .64);
        s.closePath(); return s;
    }
    function window(x, y, z, w, h, angle = 0) {
        const dir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
        const p = new THREE.Vector3(x, y, z);
        add('trim', new THREE.ShapeGeometry(pointedShape(w + .19, h + .16), compact ? 4 : 12), p.toArray(), [0, angle, 0]);
        add('recess', new THREE.ShapeGeometry(pointedShape(w, h), compact ? 4 : 12), p.clone().addScaledVector(dir, .016).toArray(), [0, angle, 0]);
        add('windows', new THREE.ShapeGeometry(pointedShape(w * .67, h * .86), compact ? 4 : 12), p.clone().addScaledVector(dir, .03).add(new THREE.Vector3(0, .05, 0)).toArray(), [0, angle, 0]);
        box('trim', p.clone().addScaledVector(dir, .047).add(new THREE.Vector3(0, h * .4, 0)).toArray(), [.045, h * .78, .055], [0, angle, 0]);
        box('trim', p.clone().addScaledVector(dir, .047).add(new THREE.Vector3(0, h * .35, 0)).toArray(), [w, .065, .055], [0, angle, 0]);
    }
    function tower(x, z, radius, height, roofHeight) {
        cylinder('stone', [x, height / 2, z], radius * .94, radius, height);
        cylinder('trim', [x, .25, z], radius * 1.13, radius * 1.17, .5);
        for (const y of [height * .34, height * .66, height - .22, height + .08])
            cylinder('trim', [x, y, z], radius * 1.04, radius * 1.04, .17);
        cone([x, height + roofHeight / 2, z], radius * 1.23, roofHeight);
        cylinder('trim', [x, height + roofHeight + .17, z], .025, .055, .38, 8);
        // Slate roof ribs and the little dormer spires on the main towers.
        for (let a = 0; a < 8; a++) {
            const angle = a * Math.PI / 4, dx = Math.sin(angle), dz = Math.cos(angle);
            for (const y of [height * .36, height * .69])
                window(x + dx * radius * .986, y, z + dz * radius * .986, radius * .34, height * .17, angle);
            if (radius > 1.4) {
                cylinder('stone', [x + dx * radius * .92, height + .2, z + dz * radius * .92], .23, .3, 1.1, 12);
                cone([x + dx * radius * .92, height + 1.12, z + dz * radius * .92], .38, 1.2);
            }
        }
    }
    function roof(x, y, z, width, depth, height) {
        const shape = new THREE.Shape();
        shape.moveTo(-width / 2, 0); shape.lineTo(width / 2, 0); shape.lineTo(0, height); shape.closePath();
        add('roof', new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 }), [x, y, z - depth / 2]);
        box('trim', [x, y + height + .06, z], [.12, .16, depth + .16]);
    }
    function hall(x, z, w, d, h, rh) {
        box('stone', [x, h / 2, z], [w, h, d]);
        box('trim', [x, .3, z], [w + .7, .6, d + .7]);
        box('trim', [x, h - .13, z], [w + .32, .32, d + .3]);
        roof(x, h, z, w + .8, d + .8, rh);
        for (const side of [-1, 1]) {
            for (let i = 0; i < 6; i++) {
                const zz = z - d / 2 + .9 + i * (d - 1.8) / 5;
                box('stone', [x + side * (w / 2 + .15), h * .39, zz], [.45, h * .78, .4]);
                add('trim', new THREE.ConeGeometry(.33, 1.1, 4), [x + side * (w / 2 + .15), h * .78 + .55, zz], [0, Math.PI / 4, 0]);
                if (i < 5) window(x + side * (w / 2 + .025), 1.9, zz + (d - 1.8) / 10, .62, h * .59, side * Math.PI / 2);
            }
            for (let i = -1; i <= 1; i++) window(x + i * w * .25, 1.8, z + side * (d / 2 + .025), w * .16, h * .58, side === 1 ? 0 : Math.PI);
        }
        for (let i = 0; i < 5; i++) {
            const zz = z - d * .4 + i * d * .2;
            tower(x, zz, .28, h + rh - .1, 1.05);
        }
    }

    // An asymmetric academy skyline: Great Hall, grand staircase tower,
    // cloister, gatehouse and a ring of narrow satellite turrets.
    cylinder('stone', [0, .1, 0], 13.6, 14, .8, 48);
    hall(-5.2, .1, 5.7, 13.8, 7.1, 4);
    tower(1.4, -4, 2.6, 13.7, 7.7);
    for (let i = 0; i < 4; i++) {
        const angle = Math.PI / 4 + i * Math.PI / 2;
        const x = 1.4 + Math.cos(angle) * 2.5, z = -4 + Math.sin(angle) * 2.5;
        box('trim', [x, 6.7, z], [.25, 13.4, .25]);
        tower(x, z, .3, 14.5, 2.1);
    }
    tower(5.4, -6.1, 1.35, 10.5, 4.9);
    tower(-1.8, -8.2, 1.3, 11.4, 5.8);
    hall(4.5, -.5, 4.4, 7.8, 5.8, 3.2);
    tower(7.9, -2.6, .92, 8.5, 3.8);
    tower(-8.4, -6.5, .92, 9.2, 4.6);
    tower(-8.4, 5.9, 1.12, 7.7, 4.8);
    tower(-1.9, 6.9, .88, 7.7, 3.8);
    // Front courtyard and a real open arched entrance.
    for (const x of [-2, 6.3]) {
        box('stone', [x, 2.2, 9], [3.2, 4.4, 2.2]);
        roof(x, 4.4, 9, 3.7, 2.7, 1.7);
        tower(x + (x < 0 ? -1.1 : 1.1), 9.3, .7, 5.4, 3.1);
    }
    const entrance = pointedShape(5.2, 5.8);
    const hole = new THREE.Path();
    hole.moveTo(-1.25, 0); hole.lineTo(-1.25, 2.4); hole.quadraticCurveTo(-1.25, 3.25, 0, 4.15);
    hole.quadraticCurveTo(1.25, 3.25, 1.25, 2.4); hole.lineTo(1.25, 0); hole.closePath();
    entrance.holes.push(hole);
    add('stone', new THREE.ExtrudeGeometry(entrance, { depth: 1.8, bevelEnabled: false }), [2.1, .05, 8]);
    window(2.1, 4.2, 9.82, .6, 1.05);
    // Cloister arcade, each arch is open through to the courtyard.
    for (let i = 0; i < 8; i++) {
        const zz = -4.8 + i * 1.7;
        box('stone', [9.2, 1.7, zz], [.55, 3.4, .4]);
        box('trim', [9.2, 3.6, zz + .65], [1.4, .5, 1.85]);
        box('roof', [9.2, 4, zz + .65], [1.9, .22, 1.85]);
    }
    // Terraced retaining wall and a broad entrance stair.
    for (let i = 0; i < 7; i++) box('trim', [2.1, .2 - i * .16, 10.1 + i * .36], [3.7 + i * .12, .22, .5]);
    const result = {};
    Object.entries(parts).forEach(([kind, geometries]) => {
        result[kind] = mergeGeometries(geometries);
        geometries.forEach(g => g.dispose());
    });
    return result;
}
