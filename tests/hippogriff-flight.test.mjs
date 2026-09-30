import test from 'node:test';
import assert from 'node:assert/strict';
import { createFlightState, stepFlight } from '../src/models/hippogriffFlight.js';
import { createCastleGeometry } from '../src/models/castleGeometry.js';
import { createHippogriffGeometry } from '../src/models/hippogriffGeometry.js';
import { CatmullRomCurve3, Vector3 } from 'three';
import { createVillageGeometry } from '../src/models/villageGeometry.js';
import { villageSites } from '../src/models/villageLayout.js';

test('flight is frame-rate independent over three minutes', () => {
    const simulate = fps => {
        const state = createFlightState();
        for (let i = 0; i < fps * 180; i++) stepFlight(state, 1 / fps);
        return state;
    };
    const base = simulate(60);
    for (const fps of [30, 120, 144]) {
        const next = simulate(fps);
        assert.ok(base.position.distanceTo(next.position) < .02, `${fps} fps position drift`);
        assert.ok(Math.abs(base.riderPitch - next.riderPitch) < .005, `${fps} fps rider drift`);
        assert.ok(Math.abs(base.heave - next.heave) < .005, `${fps} fps lift drift`);
    }
});

test('closed orbit has continuous position and tangent at the seam', () => {
    for (const width of [1, .475, .7]) {
        const { curve } = createFlightState(width);
        assert.ok(curve.getPointAt(0).distanceTo(curve.getPointAt(1)) < 1e-6);
        assert.ok(curve.getTangentAt(.99999).dot(curve.getTangentAt(.00001)) > .999);
    }
});

test('orbit matches the original dragon route, timing and mobile projection', () => {
    const legacy = new CatmullRomCurve3([
        [-23,3,-32],[-29,7,-52],[-15,13,-73],[13,10,-76],
        [28,5,-57],[26,0,-31],[8,8,-25],[-9,9,-26],
    ].map(p => new Vector3(...p)), true, 'centripetal', .5);
    for (const width of [1, .32, .52]) {
        const f = createFlightState(width);
        for (let i = 0; i < 60 * 72; i++) {
            stepFlight(f, 1 / 60);
            const expected = legacy.getPointAt((.04 + (i + 1) / 60 / 72) % 1);
            expected.x *= width;
            assert.ok(f.position.distanceTo(expected) < 1e-6);
            assert.ok(Math.abs(f.bank) <= .43);
            assert.ok(Math.abs(f.heave) < .3);
            assert.ok(Number.isFinite(f.riderPitch) && Math.abs(f.riderRoll) < .3);
        }
        assert.ok(Math.abs(f.progress - .04) < 1e-9);
    }
});

test('each text stage has one mill and two cottages, with finite merged geometry', () => {
    for (const stage of [1, 2, 3, 4]) {
        assert.equal(villageSites.filter(s => s.stage === stage && s.type === 'mill').length, 1);
        assert.equal(villageSites.filter(s => s.stage === stage && s.type === 'cottage').length, 2);
    }
    const village = createVillageGeometry([{ position: [0, -.5, 0] }]);
    assert.equal(village.rotors.length, 4);
    assert.equal(village.chimneys.length, 8);
    for (const g of [...Object.values(village.geometry), ...Object.values(village.sails)]) {
        assert.ok(g.attributes.position.array.every(Number.isFinite)); g.dispose();
    }
});

test('gliding occurs between power strokes and long stalled frames are bounded', () => {
    const f = createFlightState();
    let glides = 0, strokes = 0;
    for (let i = 0; i < 60 * 28; i++) {
        stepFlight(f, 1 / 60);
        if (f.effort < .2) glides++;
        if (f.effort > .8) strokes++;
    }
    assert.ok(glides > 60 && strokes > 60);
    const before = f.position.clone();
    stepFlight(f, 12);
    assert.ok(before.distanceTo(f.position) < .5);
});

test('authored castle and creature buffers are finite and material-batched', () => {
    for (const [build, maxBatches] of [[createCastleGeometry, 5], [createHippogriffGeometry, 46]]) {
        const geometry = build();
        assert.ok(Object.keys(geometry).length <= maxBatches);
        for (const [name, g] of Object.entries(geometry)) {
            assert.ok(g && g.attributes.position.count > 0, name);
            for (const attribute of Object.values(g.attributes)) assert.ok(attribute.array.every(Number.isFinite), name);
            g.dispose();
        }
    }
});
