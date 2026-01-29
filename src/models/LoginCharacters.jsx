import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated, config } from '@react-spring/three';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * WeStud-inspired 3D Characters
 * Features:
 * - "Shape Flip" Entrance (Elastic Staggered)
 * - Parallax/Tilt
 * - Hover Effects (Scale + Spin)
 * - Typing Zoom & Privacy Mode
 * - Scatter on Success
 * - Eye Tracking
 */

const LoginCharacters = ({ formState = 'idle', mousePos = { x: 0, y: 0 } }) => {
    const groupRef = useRef();

    // Character Refs for Internal Animation (Idle/Hover)
    const purpleRef = useRef();
    const orangeRef = useRef();
    const blackRef = useRef();
    const yellowRef = useRef();

    // Eye refs
    const purpleEyesRef = useRef();
    const orangeEyesRef = useRef();
    const blackEyesRef = useRef();
    const yellowEyeRef = useRef();

    const [hovered, setHovered] = useState(null);

    // Animation state for manual useFrame overrides
    const animState = useRef({
        targetRotation: 0,
        currentRotation: 0,
        scatter: 0,
    });

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
    }, [hovered]);

    // --- ENTRANCE ANIMATIONS (React Spring) ---
    // Initial: Rotated back X(-90deg), Side Y(-45deg), Lower Y, Smaller Scale

    const [purpleSpring] = useSpring(() => ({
        from: { position: [-0.5, -2, -0.4], rotation: [-Math.PI / 1.5, -Math.PI / 4, 0], scale: 0.8 },
        to: { position: [-0.5, 0, -0.4], rotation: [0, 0, 0], scale: 1 },
        config: { mass: 1, tension: 280, friction: 20 }, // Elastic snap
        delay: 100,
    }), []);

    const [blackSpring] = useSpring(() => ({
        from: { position: [0.6, -2.2, 0.5], rotation: [-Math.PI / 1.5, -Math.PI / 4, 0], scale: 0.8 },
        to: { position: [0.6, -0.2, 0.5], rotation: [0, 0, 0], scale: 1 },
        config: { mass: 1, tension: 280, friction: 20 },
        delay: 200, // Staggered
    }), []);

    const [orangeSpring] = useSpring(() => ({
        from: { position: [-1.4, -2.9, 0.7], rotation: [-Math.PI / 1.5, -Math.PI / 4, 0], scale: 0.8 },
        to: { position: [-1.4, -0.9, 0.7], rotation: [0, 0, 0], scale: 1 },
        config: { mass: 1, tension: 280, friction: 20 },
        delay: 300,
    }), []);

    const [yellowSpring] = useSpring(() => ({
        from: { position: [1.6, -2.4, 0.6], rotation: [-Math.PI / 1.5, -Math.PI / 4, 0], scale: 0.8 },
        to: { position: [1.6, -0.4, 0.6], rotation: [0, 0, 0], scale: 1 },
        config: { mass: 1, tension: 280, friction: 20 },
        delay: 400,
    }), []);


    // --- CONTINUOUS ANIMATION LOOP ---
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const anim = animState.current;
        const isTyping = formState === 'typing';
        const isSuccess = formState === 'success';
        const isError = formState === 'error';

        const isMobile = window.innerWidth < 768; // Simple check

        // 1. GLOBAL STATE
        const targetRot = isTyping ? Math.PI : 0;
        anim.currentRotation = THREE.MathUtils.lerp(anim.currentRotation, targetRot, 0.08);

        // Parallax Tilt (Reduced on mobile)
        const tiltX = isTyping ? 0 : (mousePos.y || 0) * (isMobile ? 0.05 : 0.15);
        const tiltY = isTyping ? 0 : (mousePos.x || 0) * (isMobile ? 0.05 : 0.15);

        if (groupRef.current) {
            groupRef.current.rotation.y = anim.currentRotation + tiltY;
            groupRef.current.rotation.x = tiltX;

            // Error Shake
            if (isError) {
                const shake = Math.sin(time * 25) * 0.15;
                groupRef.current.position.x = shake;
            } else {
                groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.1);
            }
        }

        // 2. CAMERA ZOOM & SCALE
        // Mobile: Zoom out further (larger z) and scale down model group
        const baseZoom = isMobile ? 11 : 8;
        const typingZoom = isMobile ? 9 : 5.5;
        const targetZoom = isTyping ? typingZoom : baseZoom;
        state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZoom, 0.05);

        // Adjust group scale for mobile
        const targetGroupScale = isMobile ? 0.65 : 0.9;
        groupRef.current.scale.lerp(new THREE.Vector3(targetGroupScale, targetGroupScale, targetGroupScale), 0.1);

        // 3. SCATTER LOGIC
        const targetScatter = isSuccess ? 1 : 0;
        anim.scatter = THREE.MathUtils.lerp(anim.scatter, targetScatter, 0.05);

        // 4. EYE TRACKING
        const eyeX = isTyping ? 0 : mousePos.x * 0.2;
        const eyeY = isTyping ? 0 : mousePos.y * 0.2;

        // Blink state
        const blinkOpen = Math.abs(Math.sin(time * 3)) > 0.9 ? 0.2 : 1;
        // Random blinking: 
        // A simple periodic blink is easier to implement robustly in useFrame without extra state
        // Let's use a composite wave for semi-random feel
        const isBlinking = (Math.sin(time * 0.5) > 0.98) || (Math.sin(time * 1.7 + 10) > 0.98);
        const eyeScaleY = isBlinking ? 0.1 : 1;

        const updateEyes = (ref, baseX, baseY) => {
            if (ref.current) {
                ref.current.position.x = baseX + eyeX;
                ref.current.position.y = baseY + eyeY;

                // Lerp blink
                ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, eyeScaleY, 0.4);
            }
        };

        // 5. INTERNAL CHARACTER ANIMATION (Overrides Spring positions slightly for idle/hover)

        // --- PURPLE ---
        if (purpleRef.current) {
            const isHovered = hovered === 'purple';
            // Idle Orbit (Local)
            const idleY = Math.sin(time * 1.5) * 0.05;
            const idleX = Math.cos(time * 1.5) * 0.03;

            // Scatter
            const scatterX = -2 * anim.scatter;

            // Apply animations relative to the Spring container (which is at 0,0,0 local)
            purpleRef.current.position.x = THREE.MathUtils.lerp(purpleRef.current.position.x, idleX + scatterX, 0.1);
            purpleRef.current.position.y = THREE.MathUtils.lerp(purpleRef.current.position.y, idleY, 0.1);

            // Hover Scale
            const targetScale = isHovered ? 1.15 : 1;
            purpleRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            // Spin
            if (isHovered) purpleRef.current.rotation.y += 0.1;
            else purpleRef.current.rotation.y = THREE.MathUtils.lerp(purpleRef.current.rotation.y, 0, 0.1);

            updateEyes(purpleEyesRef, 0, 0.9);
        }

        // --- ORANGE ---
        if (orangeRef.current) {
            const isHovered = hovered === 'orange';
            const idleY = Math.sin(time * 1.8 + 1) * 0.04;
            const scatterX = -2.5 * anim.scatter;

            orangeRef.current.position.x = THREE.MathUtils.lerp(orangeRef.current.position.x, scatterX, 0.1);
            orangeRef.current.position.y = THREE.MathUtils.lerp(orangeRef.current.position.y, idleY, 0.1);

            const targetScale = isHovered ? 1.15 : 1;
            orangeRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            if (isHovered) orangeRef.current.rotation.z += 0.1;
            else orangeRef.current.rotation.z = THREE.MathUtils.lerp(orangeRef.current.rotation.z, 0, 0.1);

            updateEyes(orangeEyesRef, 0, 0.7);
        }

        // --- BLACK ---
        if (blackRef.current) {
            const isHovered = hovered === 'black';
            const idleY = Math.cos(time * 1.6 + 2) * 0.04;
            const scatterX = 0.8 * anim.scatter;
            const scatterY = 0.5 * anim.scatter; // Fly up slightly

            blackRef.current.position.x = THREE.MathUtils.lerp(blackRef.current.position.x, scatterX, 0.1);
            blackRef.current.position.y = THREE.MathUtils.lerp(blackRef.current.position.y, idleY + scatterY, 0.1);

            const targetScale = isHovered ? 1.15 : 1;
            blackRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            if (isHovered) blackRef.current.rotation.y -= 0.1;
            else blackRef.current.rotation.y = THREE.MathUtils.lerp(blackRef.current.rotation.y, 0, 0.1);

            updateEyes(blackEyesRef, 0, 0.55);
        }

        // --- YELLOW ---
        if (yellowRef.current) {
            const isHovered = hovered === 'yellow';
            const idleY = Math.sin(time * 1.4 + 3) * 0.05;
            const scatterX = 2 * anim.scatter;

            yellowRef.current.position.x = THREE.MathUtils.lerp(yellowRef.current.position.x, scatterX, 0.1);
            yellowRef.current.position.y = THREE.MathUtils.lerp(yellowRef.current.position.y, idleY, 0.1);

            const targetScale = isHovered ? 1.15 : 1;
            yellowRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            if (isHovered) yellowRef.current.rotation.x += 0.1;
            else yellowRef.current.rotation.x = THREE.MathUtils.lerp(yellowRef.current.rotation.x, 0, 0.1);

            updateEyes(yellowEyeRef, -0.18, 0.4);
        }

        // Error Shake
        if (isError) {
            const shake = Math.sin(time * 25) * 0.15;
            groupRef.current.position.x = shake;
        } else {
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.1);
        }

    });

    return (
        <group ref={groupRef} position={[0, 0, 0]} scale={0.9}>

            {/* PURPLE WRAPPER (Spring) */}
            <animated.group {...purpleSpring}>
                {/* PURPLE INNER (Idle/Hover) */}
                <group
                    ref={purpleRef}
                    onPointerOver={() => setHovered('purple')}
                    onPointerOut={() => setHovered(null)}
                >
                    <mesh castShadow>
                        <boxGeometry args={[1.5, 3.4, 0.5]} />
                        <meshStandardMaterial color="#6B4FE8" roughness={0.4} metalness={0.1} />
                    </mesh>
                    <mesh castShadow position={[0, 1.7, 0]}>
                        <cylinderGeometry args={[0.75, 0.75, 0.1, 32]} />
                        <meshStandardMaterial color="#6B4FE8" roughness={0.4} metalness={0.1} />
                    </mesh>

                    <group ref={purpleEyesRef} position={[0, 0.9, 0]}>
                        <mesh position={[-0.28, 0, 0.26]}>
                            <sphereGeometry args={[0.07, 16, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        <mesh position={[0.28, 0, 0.26]}>
                            <sphereGeometry args={[0.07, 16, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                    </group>
                    <mesh position={[0, 0.45, 0.26]}>
                        <boxGeometry args={[0.06, 0.28, 0.02]} />
                        <meshBasicMaterial color="#000000" />
                    </mesh>
                </group>
            </animated.group>

            {/* ORANGE WRAPPER */}
            <animated.group {...orangeSpring}>
                <group
                    ref={orangeRef}
                    onPointerOver={() => setHovered('orange')}
                    onPointerOut={() => setHovered(null)}
                >
                    <mesh castShadow>
                        <sphereGeometry args={[1.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color="#FF6B1A" roughness={0.35} metalness={0.05} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[1.4, 32]} />
                        <meshStandardMaterial color="#FF6B1A" roughness={0.35} metalness={0.05} />
                    </mesh>

                    <group ref={orangeEyesRef} position={[0, 0.7, 0]}>
                        <mesh position={[-0.35, 0, 1.0]}>
                            <sphereGeometry args={[0.1, 16, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                        <mesh position={[0.35, 0, 1.0]}>
                            <sphereGeometry args={[0.1, 16, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                    </group>
                    <mesh position={[0, 0.35, 1.15]} rotation={[0.25, 0, 0]}>
                        <torusGeometry args={[0.25, 0.045, 8, 16, Math.PI]} />
                        <meshBasicMaterial color="#000000" />
                    </mesh>
                </group>
            </animated.group>

            {/* BLACK WRAPPER */}
            <animated.group {...blackSpring}>
                <group
                    ref={blackRef}
                    onPointerOver={() => setHovered('black')}
                    onPointerOut={() => setHovered(null)}
                >
                    <mesh castShadow>
                        <boxGeometry args={[1.0, 2.4, 0.45]} />
                        <meshStandardMaterial color="#0D0D0D" roughness={0.5} metalness={0.1} />
                    </mesh>
                    <mesh castShadow position={[0, 1.2, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
                        <meshStandardMaterial color="#0D0D0D" roughness={0.5} metalness={0.1} />
                    </mesh>

                    <group ref={blackEyesRef} position={[0, 0.55, 0]}>
                        <mesh position={[-0.2, 0, 0.24]}>
                            <circleGeometry args={[0.14, 16]} />
                            <meshBasicMaterial color="#FFFFFF" />
                        </mesh>
                        <mesh position={[-0.2, 0, 0.25]}>
                            <circleGeometry args={[0.07, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>

                        <mesh position={[0.2, 0, 0.24]}>
                            <circleGeometry args={[0.14, 16]} />
                            <meshBasicMaterial color="#FFFFFF" />
                        </mesh>
                        <mesh position={[0.2, 0, 0.25]}>
                            <circleGeometry args={[0.07, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                    </group>
                </group>
            </animated.group>

            {/* YELLOW WRAPPER */}
            <animated.group {...yellowSpring}>
                <group
                    ref={yellowRef}
                    onPointerOver={() => setHovered('yellow')}
                    onPointerOut={() => setHovered(null)}
                >
                    <mesh castShadow>
                        <capsuleGeometry args={[0.6, 1.1, 16, 32]} />
                        <meshStandardMaterial color="#E8B800" roughness={0.35} metalness={0.08} />
                    </mesh>

                    <group ref={yellowEyeRef} position={[-0.18, 0.4, 0]}>
                        <mesh position={[0, 0, 0.55]}>
                            <sphereGeometry args={[0.07, 16, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                    </group>
                    <mesh position={[0.4, 0.25, 0.55]}>
                        <boxGeometry args={[0.55, 0.05, 0.05]} />
                        <meshBasicMaterial color="#000000" />
                    </mesh>
                </group>
            </animated.group>

            {/* Realistic Soft Shadows */}
            <ContactShadows
                resolution={1024}
                scale={20}
                blur={2.5}
                opacity={0.3}
                far={10}
                color="#000000"
            />

            {formState === 'success' && <ConfettiParticles />}
        </group>
    );
};

const ConfettiParticles = () => {
    const colors = ['#FF6B1A', '#6B4FE8', '#E8B800', '#22C55E', '#EC4899'];

    const particles = useMemo(() => {
        return Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 8,
            y: 4 + Math.random() * 4,
            z: (Math.random() - 0.5) * 5,
            color: colors[i % colors.length],
            speed: 0.2 + Math.random() * 0.8,
            rotationSpeed: 1 + Math.random() * 3,
        }));
    }, []);

    const meshRefs = useRef([]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRefs.current.forEach((mesh, i) => {
            if (mesh) {
                const p = particles[i];
                mesh.position.y = p.y - ((time * p.speed * 5) % 10);
                mesh.rotation.x = time * p.rotationSpeed;
                mesh.rotation.z = time * p.rotationSpeed * 0.7;
            }
        });
    });

    return (
        <>
            {particles.map((p, i) => (
                <mesh key={p.id} ref={(el) => (meshRefs.current[i] = el)} position={[p.x, p.y, p.z]}>
                    <boxGeometry args={[0.15, 0.15, 0.04]} />
                    <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.6} />
                </mesh>
            ))}
        </>
    );
};

export default LoginCharacters;
