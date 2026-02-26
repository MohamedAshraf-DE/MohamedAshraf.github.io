import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, useContext } from "react";
import { Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";

import sakura from "../assets/sakura.mp3";
import { ThemeContext } from "../context/ThemeContext";
import { HomeInfo, Loader } from "../components";
import { soundoff, soundon } from "../assets/icons";
import { crescentMoon } from "../assets/images";
import { Bird, Island, Plane, Sky } from "../models";

const NightSkyMoon = () => {
    const moonTexture = useTexture(crescentMoon);
    return (
        <mesh position={[-65, 20, -60]}>
            <planeGeometry args={[16, 16]} />
            <meshBasicMaterial
                map={moonTexture}
                transparent={true}
                side={THREE.DoubleSide}
                color="#e0f0ff"
            />
        </mesh>
    );
};

const Home = () => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const audioRef = useRef(new Audio(sakura));
    audioRef.current.volume = 0.4;
    audioRef.current.loop = true;

    const [currentStage, setCurrentStage] = useState(1);
    const [isRotating, setIsRotating] = useState(false);
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);

    useEffect(() => {
        if (isPlayingMusic) {
            audioRef.current.play();
        }

        return () => {
            audioRef.current.pause();
        };
    }, [isPlayingMusic]);

    const adjustBiplaneForScreenSize = () => {
        let screenScale, screenPosition;

        if (window.innerWidth < 768) {
            screenScale = [1.5, 1.5, 1.5];
            screenPosition = [0, -1.5, 0];
        } else {
            screenScale = [3, 3, 3];
            screenPosition = [0, -4, -4];
        }

        return [screenScale, screenPosition];
    };

    const adjustIslandForScreenSize = () => {
        let screenScale, screenPosition;

        if (window.innerWidth < 768) {
            screenScale = [0.9, 0.9, 0.9];
            screenPosition = [0, -6.5, -43.4];
        } else {
            screenScale = [1, 1, 1];
            screenPosition = [0, -6.5, -43.4];
        }

        return [screenScale, screenPosition];
    };

    const [biplaneScale, biplanePosition] = adjustBiplaneForScreenSize();
    const [islandScale, islandPosition] = adjustIslandForScreenSize();

    return (
        <section className='w-full h-screen relative'>
            <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
                {currentStage && <HomeInfo currentStage={currentStage} />}
            </div>

            <Canvas
                className={`w-full h-screen bg-transparent ${isRotating ? "cursor-grabbing" : "cursor-grab"}`}
                camera={{ near: 0.1, far: 1000 }}
            >
                <Suspense fallback={<Loader />}>
                    {/* Directional light represents the sun. At night, it becomes ambient moonlight. */}
                    <directionalLight
                        position={isDark ? [-65, 20, -60] : [1, 1, 1]}
                        intensity={isDark ? 1.5 : 2}
                        color={isDark ? '#e0f0ff' : '#ffffff'}
                    />
                    {/* Ambient light is the general environmental light. */}
                    <ambientLight intensity={isDark ? 0.4 : 0.5} />
                    {/* Point light helps illuminate the scene nicely. */}
                    <pointLight
                        position={[10, 5, 10]}
                        intensity={isDark ? 1.2 : 2}
                        color={isDark ? '#a2d2ff' : '#ffffff'}
                    />
                    <spotLight
                        position={[0, 50, 10]}
                        angle={0.15}
                        penumbra={1}
                        intensity={isDark ? 0.7 : 2}
                        color={isDark ? '#a2d2ff' : '#ffffff'}
                    />
                    <hemisphereLight
                        skyColor={isDark ? '#0a1c4a' : '#b1e1ff'}
                        groundColor={isDark ? '#1a2035' : '#000000'}
                        intensity={isDark ? 0.4 : 1}
                    />

                    <Bird />
                    <Sky isRotating={isRotating} theme={theme} />

                    {/* Night Sky Features */}
                    {isDark && (
                        <group>
                            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                            <NightSkyMoon />
                        </group>
                    )}
                    <Island
                        isRotating={isRotating}
                        setIsRotating={setIsRotating}
                        setCurrentStage={setCurrentStage}
                        position={islandPosition}
                        rotation={[0.1, 4.7077, 0]}
                        scale={islandScale}
                    />
                    <Plane
                        isRotating={isRotating}
                        position={biplanePosition}
                        rotation={[0, 20.1, 0]}
                        scale={biplaneScale}
                    />
                </Suspense>
            </Canvas>

            {/* Drag Hint Overlay */}
            {!isRotating && currentStage === 1 && (
                <div className='absolute bottom-20 left-0 right-0 flex justify-center items-center z-10 animate-bounce pointer-events-none'>
                    <div className='bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-blue-900 font-semibold shadow-md border border-white/50'>
                        Drag to Explore ↔️
                    </div>
                </div>
            )}

            <div className='absolute bottom-2 left-2'>
                <img
                    src={!isPlayingMusic ? soundoff : soundon}
                    alt='jukebox'
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    className='w-10 h-10 cursor-pointer object-contain'
                />
            </div>
        </section>
    );
};

export default Home;