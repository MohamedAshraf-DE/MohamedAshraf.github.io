import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import birdScene from '../assets/3d/bird.glb';
import { useFlightScene } from './useFlightScene';

useGLTF.preload(birdScene);

export function Bird({ enhanced = false }) {
    const birdRef = useRef();
    const direction = useRef(1);
    const flightTime = useRef(0);
    const { scene: source, animations } = useGLTF(birdScene);
    const scene = useFlightScene(source, enhanced, animations);
    const { actions } = useAnimations(animations, scene);
    useEffect(() => {
        const action = actions['Take 001'];
        action?.reset().play();
        return () => action?.stop();
    }, [actions, scene]);
    useFrame(({ clock, camera }, delta) => {
        const bird = birdRef.current;
        if (enhanced) {
            flightTime.current += Math.min(delta, 0.05);
            const angle = flightTime.current * 0.2 + 0.5;
            const dx = -25 * Math.sin(angle), dz = 22 * Math.cos(angle);
            const dy = 3.2 * Math.cos(angle * 2);
            bird.position.set(25 * Math.cos(angle), 14 + Math.sin(angle * 2) * 1.6, 22 * Math.sin(angle));
            bird.rotation.order = 'YXZ';
            bird.rotation.set(0.12 + Math.sin(angle) * 0.06, Math.atan2(-dz, dx), Math.atan2(dy, Math.hypot(dx,dz)));
            return;
        }
        bird.position.y = Math.sin(clock.elapsedTime) * 0.2 + 2;
        if (bird.position.x > camera.position.x + 10) direction.current = -1;
        else if (bird.position.x < camera.position.x - 10) direction.current = 1;
        bird.rotation.y = direction.current === 1 ? 0 : Math.PI;
        const distance = Math.min(delta, 0.05) * 0.6 * direction.current;
        bird.position.x += distance;
        bird.position.z -= distance;
    });
    return <group ref={birdRef} position={enhanced ? [25,14,0] : [-5, 2, 1]} scale={enhanced ? 0.007 : 0.003}>
        <primitive object={scene} />
    </group>;
}
