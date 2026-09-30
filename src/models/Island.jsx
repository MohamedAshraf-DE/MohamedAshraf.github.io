import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import islandScene from '../assets/3d/island.glb';
import NatureDetails from './NatureDetails';
import { naturalMaterial, prepareIsland } from './nature';
import IslandLife from './IslandLife';
import MagicSuspension from './MagicSuspension';
import GeologicalBase from './GeologicalBase';
import MiniatureCastle from './MiniatureCastle';
import IslandVillage from './IslandVillage';
import { advanceIslandMotion } from './islandMotion';
import { Color, MathUtils } from 'three';

useGLTF.preload(islandScene);

function NaturalIsland({ nodes, sourceMaterial, nightMix, compact }) {
    const details = useMemo(() => prepareIsland(nodes, sourceMaterial), [nodes, sourceMaterial]);
    const material = useMemo(() => naturalMaterial(sourceMaterial, details.canopies), [sourceMaterial,details]);
    const colors=useMemo(()=>({day:new Color('#ffffff'),night:new Color('#ffc078')}),[]);
    useFrame(({clock})=>{
        material.emissive.lerpColors(colors.day,colors.night,nightMix.value);
        material.emissiveIntensity=MathUtils.lerp(0.025,0.035,nightMix.value);
        material.userData.cabinNight.value=nightMix.value;
        material.userData.natureTime.value=clock.elapsedTime;
    });
    useEffect(() => () => {
        material.dispose();
    }, [details, material]);
    return <>
        {details.surfaces.map(({ name, geometry }) =>
            <mesh key={name} geometry={geometry} material={material} dispose={null} castShadow receiveShadow />)}
        <NatureDetails details={details} compact={compact} />
        <IslandLife details={details} nightMix={nightMix} compact={compact} />
        <MagicSuspension nightMix={nightMix} compact={compact} />
        <Suspense fallback={null}><GeologicalBase /></Suspense>
        <Suspense fallback={null}><MiniatureCastle nightMix={nightMix} /></Suspense>
        <Suspense fallback={null}><IslandVillage details={details} nightMix={nightMix} compact={compact} /></Suspense>
    </>;
}

export function Island({ setIsRotating, setCurrentStage, nightMix, compact, ...props }) {
    const islandRef = useRef();
    const { gl } = useThree();
    const { nodes, materials } = useGLTF(islandScene);
    const movement = useRef({ dragging:false,lastX:0,lastTime:0,velocity:0,key:0,target:null,pointerId:null });
    const previousStage = useRef(1);

    useEffect(() => {
        const canvas = gl.domElement;
        const state = movement.current;
        const down = event => {
            if (event.button !== 0 && event.pointerType === 'mouse') return;
            if(state.dragging) return;
            event.preventDefault();
            state.dragging = true;
            state.lastX = event.clientX;
            state.lastTime=performance.now();state.velocity=0;
            state.target=islandRef.current.rotation.y;state.pointerId=event.pointerId;
            canvas.setPointerCapture(event.pointerId);
            setIsRotating(true);
        };
        const move = event => {
            if (!state.dragging || event.pointerId!==state.pointerId) return;
            const now=performance.now(),elapsed=Math.max(0.008,(now-state.lastTime)/1000);
            const angle=(event.clientX-state.lastX)/Math.max(1,canvas.clientWidth)*Math.PI*1.5;
            state.target+=angle;
            const speed=MathUtils.clamp(angle/elapsed,-4,4);
            state.velocity=MathUtils.lerp(state.velocity,speed,1-Math.exp(-24*elapsed));
            state.lastX = event.clientX;
            state.lastTime=now;
        };
        const up = () => {
            if(!state.dragging) return;
            state.dragging=false;state.pointerId=null;
            state.velocity=performance.now()-state.lastTime>100?0:MathUtils.clamp(state.velocity,-1.6,1.6);
            setIsRotating(state.key!==0);
        };
        const cancel = () => {
            state.dragging=false;state.key=0;state.pointerId=null;state.velocity=0;
            state.target=islandRef.current.rotation.y;setIsRotating(false);
        };
        const keyDown = event => {
            if (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,button,a,[contenteditable]')) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            state.key = event.key === 'ArrowLeft' ? 1 : -1;
            setIsRotating(true);
        };
        const keyUp = event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                state.key=0;setIsRotating(state.dragging);
            }
        };
        const previousTouchAction = canvas.style.touchAction;
        canvas.style.touchAction = 'none';
        canvas.addEventListener('pointerdown', down);
        canvas.addEventListener('pointermove', move);
        canvas.addEventListener('pointerup', up);
        canvas.addEventListener('pointercancel', cancel);
        canvas.addEventListener('lostpointercapture', up);
        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);
        window.addEventListener('blur', cancel);
        return () => {
            canvas.style.touchAction = previousTouchAction;
            canvas.removeEventListener('pointerdown', down);
            canvas.removeEventListener('pointermove', move);
            canvas.removeEventListener('pointerup', up);
            canvas.removeEventListener('pointercancel', cancel);
            canvas.removeEventListener('lostpointercapture', up);
            window.removeEventListener('keydown', keyDown);
            window.removeEventListener('keyup', keyUp);
            window.removeEventListener('blur', cancel);
        };
    }, [gl, setIsRotating]);

    useFrame((_, delta) => {
        const state = movement.current;
        islandRef.current.rotation.y=advanceIslandMotion(state,islandRef.current.rotation.y,delta);
        const rotation = ((islandRef.current.rotation.y % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const stage = rotation >= 5.45 && rotation <= 5.85 ? 4
            : rotation >= 0.85 && rotation <= 1.3 ? 3
            : rotation >= 2.4 && rotation <= 2.6 ? 2
            : rotation >= 4.25 && rotation <= 4.75 ? 1 : null;
        if (stage !== previousStage.current) {
            previousStage.current = stage;
            setCurrentStage(stage);
        }
    });

    return <group ref={islandRef} {...props}>
        <NaturalIsland nodes={nodes} sourceMaterial={materials.PaletteMaterial001} nightMix={nightMix} compact={compact} />
    </group>;
}
