// The front of each hamlet faces the camera at its matching HomeInfo stage.
export const villageSites = [
    { stage: 1, angle: 4.5 }, { stage: 2, angle: 2.5 },
    { stage: 3, angle: 1.075 }, { stage: 4, angle: 5.65 },
].flatMap(({ stage, angle }) => [
    { type: 'mill', stage, angle, radius: 18.1 },
    { type: 'cottage', stage, angle: angle - .27, radius: 17 },
    { type: 'cottage', stage, angle: angle + .27, radius: 17.3 },
].map(site => ({ ...site, x: -Math.sin(site.angle) * site.radius, z: Math.cos(site.angle) * site.radius })));

export function nearVillage(x, z, margin = 0) {
    return villageSites.some(site => Math.hypot(x - site.x, z - site.z) < (site.type === 'mill' ? 1.5 : 1.9) + margin);
}

export function villageGround(grass, x, z) {
    let distance = Infinity, y = 0;
    for (const { position } of grass) {
        const d = (x - position[0]) ** 2 + (z - position[2]) ** 2;
        if (d < distance) { distance = d; y = position[1]; }
    }
    return y + .08;
}
