import { Canvas } from "@react-three/fiber";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

import { ThemeContext } from "../context/theme";
import HomeInfo from '../components/HomeInfo';
import SceneLoading from '../components/SceneLoading';
import { Island } from "../models/Island";
import Atmosphere from "../models/Atmosphere";
import SceneDiagnostics from '../models/SceneDiagnostics';
import SceneLighting from '../models/SceneLighting';
import WorldCamera from '../models/WorldCamera';
import CinematicLandscape from '../models/CinematicLandscape';
import CloudLayers from '../models/CloudLayers';
import SkyEnvironment from '../models/SkyEnvironment';
import './home-scene.css';

const Bird = lazy(() => import('../models/Bird').then(module => ({ default: module.Bird })));

const Home = () => {
    const { theme, environment, setEnvironment } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const [nightMix]=useState(()=>({value:environment==='night'?1:environment==='sunset'?0.28:0}));
    const [sunsetMix]=useState(()=>({value:environment==='sunset'?1:0}));

    const [currentStage, setCurrentStage] = useState(1);
    const [isRotating, setIsRotating] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [sceneReady, setSceneReady] = useState(false);
    const [decorated, setDecorated] = useState(false);
    const [visible, setVisible] = useState(!document.hidden);
    const loadStart = useRef(performance.now());
    const readyReported = useRef(false);
    const reportReady = useCallback(() => {
        setSceneReady(true);
        if (import.meta.env.DEV && !readyReported.current) console.info('[Island first ready]', Math.round(performance.now() - loadStart.current), 'ms');
        readyReported.current = true;
    }, []);
    useEffect(() => {
        if (!sceneReady) return;
        // Paint the terrain/castle first; construct secondary meshes in idle time.
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(() => setDecorated(true), { timeout: 600 });
            return () => window.cancelIdleCallback(id);
        }
        const id = window.setTimeout(() => setDecorated(true), 32);
        return () => window.clearTimeout(id);
    }, [sceneReady]);
    useEffect(() => {
        const update = () => setVisible(!document.hidden);
        document.addEventListener('visibilitychange', update);
        return () => document.removeEventListener('visibilitychange', update);
    }, []);
    const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const screenWidth = screenSize.width;
    const narrow = screenSize.width / screenSize.height < 1;
    const isMobile = useMemo(() => {
        if (typeof window === 'undefined') return false;
        const ua = navigator.userAgent || '';
        const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const smallDimension = Math.min(screenSize.width, screenSize.height) < 768;
        return isMobileUA || (hasTouch && smallDimension);
    }, [screenSize]);
    const compact = isMobile || screenWidth < 768 || reduced || (navigator.hardwareConcurrency || 8) <= 4;
    const mobileBackground = isMobile || screenWidth < 768;
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
        <section aria-busy={!sceneReady} className={`w-full relative nature-scene ${isDark ? 'scene-night' : 'scene-day'}`}>
            {!sceneReady && !mobileBackground && <img className="scene-poster" src={`/scene-assets/academy/${isDark?'night':'day'}.webp`} alt="" aria-hidden="true" fetchPriority="high" />}
            {mobileBackground && (
                <div className={`mobile-scene-background mobile-bg-${environment}`} aria-hidden="true">
                    <img className="mobile-bg-image mobile-bg-day" src="/scene-assets/academy/day.webp" alt="" fetchPriority="high" />
                    <img className="mobile-bg-image mobile-bg-night" src="/scene-assets/academy/night.webp" alt="" fetchPriority="high" />
                    <div className="mobile-bg-sunset-tint" />
                </div>
            )}
            <div className='scene-intro absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
                {currentStage && <HomeInfo currentStage={currentStage} />}
            </div>

            <Canvas
                frameloop={visible ? 'always' : 'never'}
                shadows={compact ? false : THREE.PCFSoftShadowMap}
                dpr={[1, compact ? 1 : narrow ? 1.25 : 1.5]}
                gl={{ antialias: !compact, alpha: mobileBackground, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1, precision: compact ? 'mediump' : 'highp', stencil: false }}
                className={`w-full h-full bg-transparent ${isRotating ? "cursor-grabbing" : "cursor-grab"}`}
                style={{ opacity: sceneReady ? 1 : 0, transition: 'opacity 300ms ease' }}
                camera={{ near: 0.1, far: 1800 }}
            >
                <Atmosphere nightMix={nightMix} sunsetMix={sunsetMix} hideSky={mobileBackground} />
                <SkyEnvironment />
                <>
                    <PerformanceMonitor ms={500} iterations={10} bounds={() => [45,65]}
                        onDecline={() => { if (!document.hidden) setReduced(true); }} />
                    <SceneDiagnostics compact={compact} nightMix={nightMix} sunsetMix={sunsetMix} />
                    <SceneLighting environment={environment} nightMix={nightMix} sunsetMix={sunsetMix} compact={compact} target={sunTarget} />
                    {!mobileBackground && <Suspense fallback={null}><CinematicLandscape nightMix={nightMix} sunsetMix={sunsetMix} compact={compact} /></Suspense>}
                    <CloudLayers nightMix={nightMix} sunsetMix={sunsetMix} compact={compact} narrow={narrow} />
                    <WorldCamera />
                    {decorated && <Suspense fallback={null}><Bird /></Suspense>}
                    <Suspense fallback={null}>
                    <Island
                        nightMix={nightMix}
                        compact={compact}
                        decorated={decorated}
                        onReady={reportReady}
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
            {!sceneReady && <SceneLoading />}

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
