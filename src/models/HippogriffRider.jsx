import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createFlightState, stepFlight } from './hippogriffFlight';
import { createHippogriffGeometry } from './hippogriffGeometry';
import RiderLantern from './RiderLantern';

function featherMaterial(color) {
    const material = new THREE.MeshStandardMaterial({ color, roughness: .84, side: THREE.DoubleSide });
    material.onBeforeCompile = shader => {
        shader.vertexShader = 'varying vec2 featherUV;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nfeatherUV=uv;');
        shader.fragmentShader = 'varying vec2 featherUV;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
            #include <color_fragment>
            float barbs=.94+.06*sin((featherUV.y+abs(featherUV.x-.5)*.33)*290.0);
            float rachis=1.0-smoothstep(.006,.025,abs(featherUV.x-.5));
            diffuseColor.rgb*=barbs+rachis*.065;
        `);
    };
    material.customProgramCacheKey = () => 'hippogriff-feather-barbs-v1';
    return material;
}

function capeGeometry() {
    const g = new THREE.PlaneGeometry(1, 1, 14, 20), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
        const u = uv.getX(i), v = 1 - uv.getY(i);
        p.setXYZ(i, (u - .5) * (.55 + v * .65), .83 - v * .57,
            -.14 - v * 1.6 + Math.sin(u * Math.PI * 4) * .045 * v);
    }
    g.computeVertexNormals(); return g;
}

function windCloth(material, wind) {
    material.onBeforeCompile = shader => {
        Object.assign(shader.uniforms, wind);
        shader.vertexShader = 'uniform float flightTime;uniform float airGust;uniform float flightSpeed;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
            #include <begin_vertex>
            float freeHem=clamp((-position.z-.14)/1.6,0.0,1.0);
            float travellingWave=sin(flightTime*7.0+position.z*6.4+position.x*3.0);
            transformed.y+=freeHem*freeHem*(travellingWave*.075+airGust*.095+(flightSpeed-2.5)*.04);
            transformed.x+=freeHem*freeHem*(airGust*.16+sin(flightTime*4.7+position.z*4.0)*.035);
        `);
    };
    material.customProgramCacheKey = () => 'hippogriff-rider-cloth-v1';
    return material;
}

const dayColors = { coat: new THREE.Color('#deddd6'), feathers: new THREE.Color('#f3f1e9'), secondary: new THREE.Color('#b9c1c4') };
const nightColors = { coat: new THREE.Color('#151a23'), feathers: new THREE.Color('#222936'), secondary: new THREE.Color('#101722') };

export default function HippogriffRider({ narrow, compact, nightMix }) {
    const root = useRef(), body = useRef(), head = useRef(), rider = useRef(), tail = useRef();
    const wings = useRef({}), legs = useRef({});
    const reducedMotion = useRef(false);
    const aspect = useThree(state => state.size.width / state.size.height);
    const widthScale = narrow ? THREE.MathUtils.clamp(aspect * .7, .24, .52) : 1;
    const flight = useMemo(() => createFlightState(widthScale), [widthScale]);
    const resources = useMemo(() => {
        const wind = { flightTime: { value: 0 }, airGust: { value: 0 }, flightSpeed: { value: 3.5 } };
        const standard = (color, roughness = .8) => new THREE.MeshStandardMaterial({ color, roughness });
        const materials = {
            coat: standard('#deddd6'), feathers: featherMaterial('#f3f1e9'), secondary: featherMaterial('#b9c1c4'),
            beak: standard('#8f8062'), hoof: standard('#3b3430'), eye: standard('#cb9140', .25), pupil: standard('#0e1015', .2),
            leather: standard('#312723'), robe: standard('#151b25'), shirt: standard('#a0a3a0'),
            skin: standard('#c69778'), hair: standard('#191718'), glasses: standard('#282421', .35),
            scarf: standard('#76282d'), gold: standard('#bd9853'),
        };
        const cape = windCloth(new THREE.MeshStandardMaterial({ color: '#171e2a', roughness: .94, side: THREE.DoubleSide }), wind);
        const depth = windCloth(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide }), wind);
        return { geometries: createHippogriffGeometry(), materials, cape: capeGeometry(), capeMaterial: cape, depth, wind };
    }, []);
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => { reducedMotion.current = query.matches; };
        update(); query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    useEffect(() => () => {
        Object.values(resources.geometries).forEach(g => g.dispose());
        Object.values(resources.materials).forEach(m => m.dispose());
        resources.cape.dispose(); resources.capeMaterial.dispose(); resources.depth.dispose();
    }, [resources]);
    useFrame((_, delta) => {
        if (document.hidden || !root.current) return;
        stepFlight(flight, delta, { reducedMotion: reducedMotion.current });
        const f = flight, t = f.time;
        root.current.position.copy(f.position);
        root.current.quaternion.copy(f.quaternion);
        body.current.position.y = f.heave;
        body.current.rotation.x = f.heaveVelocity * .035;
        head.current.rotation.set(-f.pitch * .22 - f.heaveVelocity * .05, -f.turn * .7, -f.bank * .16);
        rider.current.rotation.set(f.riderPitch, f.gust * .018, f.riderRoll);
        tail.current.rotation.set(-f.heaveVelocity * .16, f.gust * .15 - f.bank * .23, f.gust * .08);
        for (const side of [-1, 1]) {
            const wing = wings.current[side], tip = wings.current[`tip${side}`];
            wing.rotation.z = side * (f.flap + side * f.bank * .15);
            wing.rotation.y = side * (.06 + f.effort * .06);
            tip.rotation.z = side * (f.tip + f.gust * .04);
            tip.rotation.y = side * (.06 + Math.max(0, Math.sin(f.phase)) * f.effort * .15);
            legs.current[`hind${side}`].rotation.x = -.15 - f.heaveVelocity * .22 + Math.sin(t * 1.4 + side) * .045;
            legs.current[`fore${side}`].rotation.x = .13 - f.heaveVelocity * .16 + Math.sin(t * 1.5 + side) * .035;
        }
        resources.wind.flightTime.value = t;
        resources.wind.airGust.value = f.gust;
        resources.wind.flightSpeed.value = f.speed;
        for (const kind of Object.keys(dayColors)) resources.materials[kind].color.lerpColors(dayColors[kind], nightColors[kind], nightMix.value);
    });
    const meshes = part => Object.entries(resources.geometries).filter(([key]) => key.startsWith(`${part}:`)).map(([key, geometry]) =>
        <mesh key={key} geometry={geometry} material={resources.materials[key.split(':')[1]]} castShadow={!compact} receiveShadow dispose={null} />);
    return <group ref={root} name="Hippogriff and Harry flight rig" scale={narrow ? .75 : 1.45} position={[-23, 3, -32]}>
        <group ref={body}>
            {meshes('body')}{meshes('saddle')}{meshes('reins')}
            <group ref={head} position={[0, 1.34, 1.86]}>{meshes('head')}</group>
            <group ref={tail} position={[0, .12, -1.94]}>{meshes('tail')}</group>
            {[-1, 1].map(side => <group key={side}>
                <group ref={el => { wings.current[side] = el; }} position={[side * .63, .56, .7]}>
                    {meshes(side < 0 ? 'wingLeft' : 'wingRight')}
                    <group ref={el => { wings.current[`tip${side}`] = el; }} position={[side * 2.35, 0, -.12]}>
                        {meshes(side < 0 ? 'tipLeft' : 'tipRight')}
                    </group>
                </group>
                <group ref={el => { legs.current[`hind${side}`] = el; }} position={[side * .5, -.24, -1.37]}>{meshes(side < 0 ? 'hindLeft' : 'hindRight')}</group>
                <group ref={el => { legs.current[`fore${side}`] = el; }} position={[side * .52, -.31, .87]}>{meshes(side < 0 ? 'foreLeft' : 'foreRight')}</group>
            </group>)}
            <group position={[0, .83, -.32]}>
                {meshes('riderLegs')}
                <group ref={rider}>
                    {meshes('rider')}
                    <RiderLantern nightMix={nightMix} flight={flight} />
                    <mesh geometry={resources.cape} material={resources.capeMaterial} customDepthMaterial={resources.depth} castShadow={!compact} dispose={null} />
                </group>
            </group>
        </group>
    </group>;
}
