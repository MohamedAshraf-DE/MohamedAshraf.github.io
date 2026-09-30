import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { villageSites, villageGround } from './villageLayout.js';

export function createVillageGeometry(grass) {
    const parts = {}, rotors = [], chimneys = [], flowers = [];
    const local = new THREE.Object3D(), placement = new THREE.Object3D();
    function add(kind, geometry, position, rotation = [0, 0, 0]) {
        local.position.fromArray(position); local.rotation.set(...rotation); local.updateMatrix();
        geometry.applyMatrix4(local.matrix).applyMatrix4(placement.matrix);
        const flat = geometry.index ? geometry.toNonIndexed() : geometry;
        if (flat !== geometry) geometry.dispose();
        (parts[kind] ||= []).push(flat);
    }
    const box = (kind, p, s, r) => add(kind, new THREE.BoxGeometry(...s), p, r);
    function roof(w, d, y, h) {
        const shape = new THREE.Shape();
        shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0); shape.lineTo(0, h); shape.closePath();
        add('slate', new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false }), [0, y, -d / 2]);
    }
    function window(x, y, z, angle = 0) {
        box('wood', [x, y, z], [.64, .83, .09], [0, angle, 0]);
        box('windows', [x + Math.sin(angle) * .06, y, z + Math.cos(angle) * .06], [.47, .66, .03], [0, angle, 0]);
        box('wood', [x + Math.sin(angle) * .09, y, z + Math.cos(angle) * .09], [.045, .74, .035], [0, angle, 0]);
        box('wood', [x + Math.sin(angle) * .09, y, z + Math.cos(angle) * .09], [.51, .045, .035], [0, angle, 0]);
    }
    for (const [index, site] of villageSites.entries()) {
        const y = villageGround(grass, site.x, site.z);
        placement.position.set(site.x, y, site.z); placement.rotation.set(0, -site.angle, 0); placement.updateMatrix();
        if (site.type === 'mill') {
            add('stone', new THREE.CylinderGeometry(.74, 1.13, 4.3, 16), [0, 2.15, 0]);
            add('slate', new THREE.ConeGeometry(1.15, 1.7, 16), [0, 5.05, 0]);
            add('stone', new THREE.CylinderGeometry(1.25, 1.34, .3, 20), [0, .15, 0]);
            for (const h of [.45, 2.75, 4.2]) add('wood', new THREE.CylinderGeometry(h > 4 ? .83 : 1.06, h > 4 ? .83 : 1.06, .12, 16), [0, h, 0]);
            box('wood', [0, .73, 1.04], [.66, 1.4, .13]);
            window(.72, 2.5, .23, Math.PI / 2);
            const hub = new THREE.Vector3(0, 3.85, 1.08).applyMatrix4(placement.matrix);
            rotors.push({ position: hub.toArray(), angle: -site.angle, phase: index * .63, speed: .29 + site.stage * .025 });
            // A small timber balcony beneath the sails.
            box('wood', [0, 1.75, 1], [2.2, .12, 1]);
            for (const x of [-.95, .95]) box('wood', [x, 2.08, 1.43], [.07, .7, .07]);
            box('wood', [0, 2.4, 1.43], [2, .08, .08]);
        } else {
            box('stone', [0, .14, 0], [2.8, .28, 3]);
            box('plaster', [0, 1.18, 0], [2.35, 2.12, 2.55]);
            roof(2.85, 3, 2.24, 1.72);
            for (const x of [-1.19, 1.19]) for (const z of [-1.3, 1.3]) box('wood', [x, 1.24, z], [.12, 2.26, .12]);
            box('wood', [0, 2.2, 1.31], [2.5, .12, .12]);
            box('wood', [0, .8, 1.32], [.61, 1.5, .09]);
            for (const x of [-.77, .77]) window(x, 1.43, 1.32);
            for (const side of [-1, 1]) window(side * 1.19, 1.38, .15, side * Math.PI / 2);
            box('stone', [.64, 3.46, -.57], [.44, 1.45, .48]);
            box('wood', [.64, 4.2, -.57], [.55, .16, .6]);
            chimneys.push(new THREE.Vector3(.64, 4.32, -.57).applyMatrix4(placement.matrix).toArray());
            // Entrance step, bench and planted window boxes.
            box('stone', [0, .11, 1.65], [.93, .22, .52]);
            box('wood', [-.8, .4, 1.75], [.85, .11, .35]);
            for (const x of [-1.1, -.5]) box('wood', [x, .21, 1.75], [.08, .38, .27]);
            for (const x of [-.77, .77]) {
                box('wood', [x, .92, 1.5], [.65, .18, .34]);
                for (let i = 0; i < 5; i++) flowers.push({ position: new THREE.Vector3(x - .24 + i * .12, 1.08, 1.55).applyMatrix4(placement.matrix).toArray(), color: index % 2 ? '#c19ada' : '#efc45d' });
            }
        }
        // Short stepping-stone approaches connect the village to the castle.
        for (let j = 0; j < 5; j++) box('path', [(j % 2) * .1, .03 - j * .025, -1.7 - j * .55], [.75, .11, .42], [0, (j % 3 - 1) * .12, 0]);
    }
    const geometry = {};
    for (const [kind, list] of Object.entries(parts)) { geometry[kind] = mergeGeometries(list); list.forEach(g => g.dispose()); }
    // A pair of instanced meshes draws all four rotating lattice sail assemblies.
    placement.position.set(0, 0, 0); placement.rotation.set(0, 0, 0); placement.updateMatrix();
    for (const key of Object.keys(parts)) delete parts[key];
    for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        const sailBox = (kind, x, y, w, h, depth) => box(kind, [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), 0], [w, h, depth], [0, 0, a]);
        sailBox('frame', 0, 1.15, .11, 2.55, .13);
        sailBox('canvas', .3, 1.38, .54, 1.65, .035);
        sailBox('frame', .59, 1.38, .07, 1.78, .07);
        for (let j = 0; j < 6; j++) sailBox('frame', .3, .58 + j * .32, .65, .065, .07);
    }
    add('frame', new THREE.CylinderGeometry(.23, .23, .36, 12), [0, 0, .05], [Math.PI / 2, 0, 0]);
    const sails = {};
    for (const [kind, list] of Object.entries(parts)) { sails[kind] = mergeGeometries(list); list.forEach(g => g.dispose()); }
    return { geometry, sails, rotors, chimneys, flowers };
}
