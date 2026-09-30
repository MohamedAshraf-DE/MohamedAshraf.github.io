import { CatmullRomCurve3, Euler, MathUtils, Quaternion, Vector3 } from 'three';

const TAU = Math.PI * 2;
const smooth = (a, b, t) => MathUtils.smoothstep(t, a, b);

export function createFlightState(widthScale = 1) {
    // Preserve DragonRider's original route, arc-length sampling and 72 s lap.
    // Compress X after sampling, just as the old mobile flight did.
    const curve = new CatmullRomCurve3([
        [-23,3,-32],[-29,7,-52],[-15,13,-73],[13,10,-76],
        [28,5,-57],[26,0,-31],[8,8,-25],[-9,9,-26],
    ].map(p => new Vector3(...p)), true, 'centripetal', .5);
    return {
        curve, widthScale, length: curve.getLength(), progress: .04, time: 0, phase: 0, initialized: false,
        speed: 3.2, bank: 0, pitch: 0, heave: 0, heaveVelocity: 0,
        riderPitch: .08, riderPitchVelocity: 0, riderRoll: 0, riderRollVelocity: 0,
        position: new Vector3(), tangent: new Vector3(), ahead: new Vector3(),
        euler: new Euler(0, 0, 0, 'YXZ'), quaternion: new Quaternion(), targetQuaternion: new Quaternion(),
        flap: 0, tip: 0, effort: 0, gust: 0, turn: 0, lift: 0,
    };
}

function spring(state, key, velocity, target, stiffness, damping, dt) {
    state[velocity] += ((target - state[key]) * stiffness - state[velocity] * damping) * dt;
    state[key] += state[velocity] * dt;
}

// Substep the inertial response. Wing lift drives the body; Harry's upper body
// and cloth follow with their own delayed response instead of a rigid bob.
export function stepFlight(state, delta, { reducedMotion = false } = {}) {
    const elapsed = Math.min(Math.max(delta, 0), .1);
    const count = Math.max(1, Math.ceil(elapsed / (1 / 120)));
    const dt = elapsed / count;
    for (let i = 0; i < count; i++) {
        state.time += dt;
        const t = state.time;
        state.curve.getTangentAt(state.progress, state.tangent);
        const climb = state.tangent.y;
        state.speed = state.length / (reducedMotion ? 144 : 72);
        state.progress = (state.progress + dt / (reducedMotion ? 144 : 72)) % 1;
        state.curve.getPointAt(state.progress, state.position);
        state.position.x *= state.widthScale;
        state.curve.getTangentAt(state.progress, state.tangent);
        state.curve.getTangentAt((state.progress + .012) % 1, state.ahead);
        state.tangent.x *= state.widthScale; state.tangent.normalize();
        state.ahead.x *= state.widthScale; state.ahead.normalize();
        const heading = Math.atan2(state.tangent.x, state.tangent.z);
        state.turn = MathUtils.euclideanModulo(Math.atan2(state.ahead.x, state.ahead.z) - heading + Math.PI, TAU) - Math.PI;
        state.gust = reducedMotion ? 0 : Math.sin(t * .71) * .45 + Math.sin(t * 1.17 + 2.3) * .23 + Math.sin(t * 2.91) * .08;
        state.bank = MathUtils.clamp(-state.turn * 3.2, -.43, .43);
        state.pitch = -Math.asin(state.tangent.y);
        state.euler.set(state.pitch, heading, state.bank);
        state.targetQuaternion.setFromEuler(state.euler);
        if (!state.initialized) { state.quaternion.copy(state.targetQuaternion); state.initialized = true; }
        else state.quaternion.slerp(state.targetQuaternion, 1 - Math.exp(-5 * dt));
        // Several power strokes, then a glide; climbing calls for more effort.
        const cycle = (t % 13) / 13;
        const burst = 1 - smooth(.43, .59, cycle) + smooth(.88, 1, cycle);
        state.effort = MathUtils.damp(state.effort, reducedMotion ? .12 : MathUtils.clamp(burst + climb * .65, .08, 1), 3.1, dt);
        state.phase += dt * TAU * (.68 + state.effort * .16);
        // Faster downstroke and slower recovery, with delayed flexible tips.
        const stroke = Math.sin(state.phase + .26 * Math.sin(state.phase));
        state.flap = .08 + stroke * .62 * state.effort;
        state.tip = Math.sin(state.phase - .62) * .29 * state.effort - .08;
        state.lift = Math.max(0, -Math.cos(state.phase)) * state.effort;
        const heaveTarget = (state.lift - .32 * state.effort) * .23 + state.gust * .09;
        spring(state, 'heave', 'heaveVelocity', heaveTarget, 18, 5.8, dt);
        spring(state, 'riderPitch', 'riderPitchVelocity', .13 + state.pitch * .17 - state.heaveVelocity * .16, 30, 8.4, dt);
        spring(state, 'riderRoll', 'riderRollVelocity', -state.bank * .32 - state.gust * .025, 21, 6.8, dt);
    }
    return state;
}
