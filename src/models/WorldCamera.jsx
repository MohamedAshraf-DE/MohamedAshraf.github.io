import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';

export default function WorldCamera() {
    const target = useMemo(() => new Vector3(0, 0, -43), []);
    const pointer = useRef({ x: 0, y: 0 });
    useEffect(() => {
        const move = event => {
            if (event.pointerType === 'touch') return;
            pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
            pointer.current.y = (0.5 - event.clientY / window.innerHeight) * 2;
        };
        const leave = () => { pointer.current.x = 0; pointer.current.y = 0; };
        window.addEventListener('pointermove', move); window.addEventListener('blur', leave);
        return () => { window.removeEventListener('pointermove', move); window.removeEventListener('blur', leave); };
    }, []);
    useFrame(({ camera, size }, delta) => {
        const portrait = size.width < size.height;
        camera.position.x = MathUtils.damp(camera.position.x, portrait ? 0 : pointer.current.x * 1.4, 2.5, Math.min(delta, .05));
        camera.position.y = MathUtils.damp(camera.position.y, portrait ? 0 : pointer.current.y * .4, 2.5, Math.min(delta, .05));
        camera.lookAt(target);
    });
    return null;
}
