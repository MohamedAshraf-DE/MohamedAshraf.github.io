import { useEffect, useRef } from 'react';

export default function useSceneMotion() {
    const motion = useRef({ time: 0, reduced: false });
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => { motion.current.reduced = query.matches; };
        update(); query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    return motion;
}
