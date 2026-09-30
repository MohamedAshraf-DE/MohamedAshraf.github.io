import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

import { ThemeContext } from "../context/theme";
import { HomeInfo } from "../components";
import { Island } from "../models/Island";
import HippogriffRider from '../models/HippogriffRider';
import Atmosphere from "../models/Atmosphere";
import SceneDiagnostics from '../models/SceneDiagnostics';
import SceneLighting from '../models/SceneLighting';
import WorldCamera from '../models/WorldCamera';
import CinematicLandscape from '../models/CinematicLandscape';
import CloudLayers from '../models/CloudLayers';
import SkyEnvironment from '../models/SkyEnvironment';
import './home-scene.css';

const Home = () => {
    const { theme, environment, setEnvironment } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const [nightMix]=useState(()=>({value:environment==='night'?1:environment==='sunset'?0.28:0}));
    const [sunsetMix]=useState(()=>({value:environment==='sunset'?1:0}));

    const [currentStage, setCurrentStage] = useState(1);
    const [isRotating, setIsRotating] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const screenWidth = screenSize.width;
    const narrow = screenSize.width / screenSize.height < 1;
    const compact = screenWidth < 768 || reduced || (navigator.hardwareConcurrency || 8) <= 4;
    const sunTarget = useMemo(() => {
        const target = new THREE.Object3D();
        target.position.set(0, 0, -43);
        return target;
    }, []);
    useEffect(() => {
        const resize = () => setScreenSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const adjustIslandForScreenSize = () => {
        let screenScale, screenPosition;

        if (narrow) {
            const fit = Math.min(0.8, Math.max(0.4, screenSize.width / screenSize.height * 0.95));
            screenScale = [fit, fit, fit];
            screenPosition = [0, -3.7, -43.4];
        } else {
            screenScale = [0.85, 0.85, 0.85];
            screenPosition = [0, -3.7, -43.4];
        }

        return [screenScale, screenPosition];
    };

    const [islandScale, islandPosition] = adjustIslandForScreenSize();

    return (
        <section className={`w-full h-screen relative nature-scene ${isDark ? 'scene-night' : 'scene-day'}`}>
            <div className='scene-intro absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
                {currentStage && <HomeInfo currentStage={currentStage} />}
            </div>

            <Canvas
                shadows={THREE.PCFSoftShadowMap}
                dpr={[1, compact ? 1 : narrow ? 1.25 : 1.5]}
                gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
                className={`w-full h-screen bg-transparent ${isRotating ? "cursor-grabbing" : "cursor-grab"}`}
                camera={{ near: 0.1, far: 1800 }}
            >
                <Atmosphere nightMix={nightMix} sunsetMix={sunsetMix} />
                <SkyEnvironment />
                <>
                    <PerformanceMonitor ms={500} iterations={10} bounds={() => [45,65]}
                        onDecline={() => { if (!document.hidden) setReduced(true); }} />
                    <SceneDiagnostics compact={compact} nightMix={nightMix} sunsetMix={sunsetMix} />
                    <SceneLighting environment={environment} nightMix={nightMix} sunsetMix={sunsetMix} compact={compact} target={sunTarget} />
                    <Suspense fallback={null}><CinematicLandscape nightMix={nightMix} sunsetMix={sunsetMix} /></Suspense>
                    <CloudLayers nightMix={nightMix} sunsetMix={sunsetMix} compact={compact} narrow={narrow} />
                    <WorldCamera />
                    <Suspense fallback={null}><HippogriffRider narrow={narrow} compact={compact} nightMix={nightMix} /></Suspense>
                    <Suspense fallback={null}>
                    <Island
                        nightMix={nightMix}
                        compact={compact}
                        setIsRotating={setIsRotating}
                        setCurrentStage={setCurrentStage}
                        position={islandPosition}
                        rotation={[0.1, 4.7077, 0]}
                        scale={islandScale}
                    />
                    </Suspense>
                </>
            </Canvas>

            <div className="scene-vignette" aria-hidden="true" />

            <div className="environment-switch" role="group" aria-label="World lighting">
                {['day','sunset','night'].map(mode=><button key={mode} type="button" aria-pressed={environment===mode}
                    onClick={()=>setEnvironment(mode)}>{mode==='day'?'Day':mode==='sunset'?'Sunset':'Night'}</button>)}
            </div>

            {/* Recruiter Mode Button */}
            <div className='scene-actions'>
                <p className="scene-hint"><span aria-hidden="true">↔</span> Drag to explore</p>
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
