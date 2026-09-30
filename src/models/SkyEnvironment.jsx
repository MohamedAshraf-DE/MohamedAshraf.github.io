import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

// Soft original sky/ground gradients supply broad reflections without an HDRI download.
export default function SkyEnvironment() {
    const texture=useMemo(()=>{
        const faces=Array.from({length:6},(_,index)=>{
            const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
            const context=canvas.getContext('2d'),gradient=context.createLinearGradient(0,0,0,128);
            gradient.addColorStop(0,index===3?'#777b65':'#719bbb');
            gradient.addColorStop(0.48,index===2?'#b5cddd':'#d5d4bc');gradient.addColorStop(1,index===2?'#94b6cf':'#747964');
            context.fillStyle=gradient;context.fillRect(0,0,128,128);return canvas;
        });
        const result=new THREE.CubeTexture(faces);result.colorSpace=THREE.SRGBColorSpace;result.needsUpdate=true;return result;
    },[]);
    useEffect(()=>()=>texture.dispose(),[texture]);
    return <primitive attach="environment" object={texture} />;
}
