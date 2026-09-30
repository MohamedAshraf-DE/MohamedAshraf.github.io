import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createVillageGeometry } from './villageGeometry';
import useSceneMotion from './useSceneMotion';

export default function IslandVillage({ details, nightMix, compact }) {
    const frame = useRef(), canvas = useRef(), flowers = useRef();
    const motion = useSceneMotion();
    const source = useTexture('/scene-assets/materials/fort-wall-diff.webp');
    const resources = useMemo(() => {
        const village = createVillageGeometry(details.grass);
        const texture = source.clone(); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.colorSpace = THREE.SRGBColorSpace; texture.repeat.set(1, 2); texture.needsUpdate = true;
        const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .9, ...extra });
        const materials = {
            stone: material('#a4987c', { map: texture }), plaster: material('#bdad89', { map: texture }),
            slate: material('#475b61'), wood: material('#554534'), path: material('#8d8971'),
            windows: material('#738177', { emissive: '#ffbb61', emissiveIntensity: 0 }),
            canvas: material('#c4bb9d', { side: THREE.DoubleSide }),
        };
        const smoke = new THREE.BufferGeometry(), positions = [], seeds = [];
        for (const [index, chimney] of village.chimneys.entries()) {
            for (let i = 0; i < (compact ? 4 : 7); i++) { positions.push(...chimney); seeds.push(index * 1.3 + i / (compact ? 4 : 7)); }
        }
        smoke.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        smoke.setAttribute('seed', new THREE.Float32BufferAttribute(seeds, 1));
        return { ...village, materials, texture, smoke, dummy: new THREE.Object3D(), rotation: new THREE.Quaternion(), axis: new THREE.Vector3(0, 0, 1), uniforms: { time: { value: 0 }, night: nightMix } };
    }, [details, source, compact, nightMix]);
    useLayoutEffect(() => {
        const dummy = resources.dummy;
        resources.flowers.forEach(({ position, color }, i) => {
            dummy.position.fromArray(position); dummy.rotation.set(0, i * 1.7, 0); dummy.scale.set(.1, .13, .1); dummy.updateMatrix();
            flowers.current.setMatrixAt(i, dummy.matrix); flowers.current.setColorAt(i, new THREE.Color(color));
        });
        flowers.current.instanceMatrix.needsUpdate = true; flowers.current.instanceColor.needsUpdate = true;
        flowers.current.computeBoundingSphere();
    }, [resources]);
    useEffect(() => () => {
        Object.values(resources.geometry).forEach(g => g.dispose()); Object.values(resources.sails).forEach(g => g.dispose());
        Object.values(resources.materials).forEach(m => m.dispose()); resources.texture.dispose(); resources.smoke.dispose();
    }, [resources]);
    useFrame((_, delta) => {
        if (!document.hidden && !motion.current.reduced) motion.current.time += Math.min(delta, .05);
        const t = motion.current.time, dummy = resources.dummy;
        resources.uniforms.time.value = t;
        resources.materials.windows.emissiveIntensity = nightMix.value * 1.8;
        for (const [index, rotor] of resources.rotors.entries()) {
            dummy.position.fromArray(rotor.position); dummy.rotation.set(0, rotor.angle, 0); dummy.scale.setScalar(1);
            resources.rotation.setFromAxisAngle(resources.axis, -t * rotor.speed + rotor.phase + Math.sin(t * .3) * .07);
            dummy.quaternion.multiply(resources.rotation); dummy.updateMatrix();
            frame.current.setMatrixAt(index, dummy.matrix); canvas.current.setMatrixAt(index, dummy.matrix);
        }
        frame.current.instanceMatrix.needsUpdate = true; canvas.current.instanceMatrix.needsUpdate = true;
    });
    return <group name="Four village hamlets">
        {Object.entries(resources.geometry).map(([kind, g]) => <mesh key={kind} geometry={g} material={resources.materials[kind]} castShadow receiveShadow dispose={null} />)}
        <instancedMesh ref={frame} args={[resources.sails.frame, resources.materials.wood, 4]} frustumCulled={false} castShadow dispose={null} />
        <instancedMesh ref={canvas} args={[resources.sails.canvas, resources.materials.canvas, 4]} frustumCulled={false} castShadow dispose={null} />
        <instancedMesh ref={flowers} args={[undefined, undefined, resources.flowers.length]}>
            <icosahedronGeometry args={[1, 1]} /><meshStandardMaterial roughness={.95} />
        </instancedMesh>
        <points geometry={resources.smoke} frustumCulled={false}>
            <shaderMaterial uniforms={resources.uniforms} transparent depthWrite={false}
                vertexShader={`uniform float time;attribute float seed;varying float opacity;
                    void main(){float age=fract(seed+time*.065);vec3 p=position;
                        p.y+=age*3.4;p.x+=age*age*1.7+sin(time*.35+seed)*age*.35;p.z+=age*.45;
                        vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;
                        gl_PointSize=min(34.0,(5.0+age*15.0)*30.0/max(1.0,-mv.z));opacity=sin(age*3.14159)*.13;}`}
                fragmentShader={`uniform float night;varying float opacity;void main(){float r=length(gl_PointCoord-.5)*2.0;
                    gl_FragColor=vec4(mix(vec3(.76,.78,.74),vec3(.36,.43,.5),night),pow(max(0.0,1.0-r),2.0)*opacity);}`} />
        </points>
    </group>;
}
