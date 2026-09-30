import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Development-only, one settled sample per quality tier. Nothing is drawn in UI.
export default function SceneDiagnostics({ compact, nightMix, sunsetMix }) {
    const sample=useRef({start:0,frames:0,quality:null,done:false});
    const transition=useRef({last:null,lastSunset:null,active:false,frames:0,maxFrameMs:0,programs:0});
    useFrame(({gl},delta)=>{
        if(!import.meta.env.DEV || document.hidden) return;
        const theme=transition.current,night=nightMix.value,sunset=sunsetMix?.value||0;
        if(theme.last!==null && (Math.abs(theme.last-night)>0.000001||Math.abs(theme.lastSunset-sunset)>0.000001)){
            if(!theme.active){
                theme.active=true;theme.frames=0;theme.maxFrameMs=0;theme.programs=gl.info.programs?.length;
            }
        }
        if(theme.active){
            theme.frames++;theme.maxFrameMs=Math.max(theme.maxFrameMs,delta*1000);
            if((night===0 || night===1 || night===0.28)&&(sunset===0||sunset===1)){
                console.info('[Island theme transition]',JSON.stringify({frames:theme.frames,
                    maxFrameMs:Math.round(theme.maxFrameMs),programsBefore:theme.programs,programsAfter:gl.info.programs?.length}));
                theme.active=false;
            }
        }
        theme.last=night;theme.lastSunset=sunset;
        const state=sample.current;
        if(state.quality!==compact){state.quality=compact;state.start=performance.now();state.frames=0;state.done=false;}
        if(state.done) return;
        // Ignore the first two seconds while shaders compile and buffers upload.
        const elapsed=performance.now()-state.start;
        if(elapsed<2000) return;
        if(delta>0.5){state.start=performance.now();state.frames=0;return;}
        state.frames++;
        if(elapsed>7000){
            console.info('[Island performance]',JSON.stringify({
                quality:compact?'compact':'desktop',fps:Math.round(state.frames/((elapsed-2000)/1000)),
                drawCalls:gl.info.render.calls,triangles:gl.info.render.triangles,
                textures:gl.info.memory.textures,geometries:gl.info.memory.geometries,
                programs:gl.info.programs?.length,dpr:gl.getPixelRatio()
            }));
            state.done=true;
        }
    });
    return null;
}
