import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";

import godfather from "../assets/godfather_clean.webm";
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

    const audioRef = useRef(new Audio(godfather));
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

            {/* Drag Hint Overlay Removed */}

            <div className='absolute top-6 left-6 z-10'>
                <img
                    src={!isPlayingMusic ? soundoff : soundon}
                    alt='jukebox'
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    className='w-10 h-10 cursor-pointer object-contain'
                />
            </div>

            {/* Recruiter Mode Button */}
            <div className='absolute bottom-10 left-0 right-0 flex justify-center items-center z-10 pointer-events-auto'>
                <Link to="/recruiter" className="px-6 py-2.5 bg-slate-900/80 backdrop-blur-md text-white font-semibold rounded-full shadow-lg border border-white/10 hover:bg-blue-600 transition-colors flex items-center gap-2 group">
                    <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Recruiter Mode
                </Link>
            </div>
        </section>
    );
};

export default Home;