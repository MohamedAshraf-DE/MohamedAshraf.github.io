import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

export default function RiderLantern({ nightMix, flight }) {
    const hinge = useRef(), glass = useRef(), lamp = useRef(), flame = useRef();
    useFrame(() => {
        const t = flight.time;
        // Sunset reaches .28: keep the lamp off until the world enters night.
        const night = MathUtils.smoothstep(nightMix.value, .4, .95);
        const flicker = 1 + Math.sin(t * 9.1) * .055 + Math.sin(t * 13.7) * .025;
        hinge.current.rotation.z = -flight.bank * .45 + flight.gust * .13;
        hinge.current.rotation.x = -flight.riderPitch * .55 + Math.sin(t * 1.8) * .04;
        glass.current.emissiveIntensity = night * 3.5 * flicker;
        lamp.current.intensity = night * 5 * flicker;
        flame.current.visible = night > .01;
    });
    return <group ref={hinge} name="Harry's night lantern" position={[.43, .29, .75]}>
        <mesh position={[0, -.055, 0]}><torusGeometry args={[.105, .014, 6, 16]} /><meshStandardMaterial color="#8b7146" metalness={.65} roughness={.4} /></mesh>
        <group position={[0, -.35, 0]}>
            <mesh><cylinderGeometry args={[.13, .15, .31, 6]} />
                <meshStandardMaterial ref={glass} color="#a08e68" emissive="#ffb344" emissiveIntensity={0} roughness={.36} metalness={.12} /></mesh>
            {[-1, 1].flatMap(x => [-1, 1].map(z => <mesh key={`${x}:${z}`} position={[x * .115, 0, z * .09]}>
                <boxGeometry args={[.023, .34, .023]} /><meshStandardMaterial color="#594b32" metalness={.7} roughness={.45} /></mesh>))}
            <mesh position={[0, .21, 0]}><coneGeometry args={[.19, .13, 6]} /><meshStandardMaterial color="#8b7146" metalness={.7} roughness={.4} /></mesh>
            <mesh position={[0, -.19, 0]}><cylinderGeometry args={[.18, .14, .055, 6]} /><meshStandardMaterial color="#8b7146" metalness={.7} roughness={.4} /></mesh>
            <mesh ref={flame} position={[0, 0, .13]} scale={[.025, .07, .025]}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#ffe6a1" toneMapped={false} /></mesh>
            <pointLight ref={lamp} color="#ffb65b" intensity={0} distance={5} decay={2} />
        </group>
    </group>;
}
