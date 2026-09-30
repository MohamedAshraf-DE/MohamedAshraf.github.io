import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { randomGenerator } from './nature';

export default function NightStars({ nightMix, compact }) {
    const geometry=useMemo(()=>{
        const random=randomGenerator(888),positions=[],sizes=[],phases=[],colors=[];
        for(let i=0;i<(compact?500:1200);i++){
            const azimuth=random()*Math.PI*2,y=0.1+random()*0.9,radius=1400+random()*170,ring=Math.sqrt(1-y*y);
            positions.push(Math.cos(azimuth)*ring*radius,y*radius,Math.sin(azimuth)*ring*radius);
            sizes.push(0.7+random()*2.3);phases.push(random()*6.28);
            const color=new THREE.Color().setHSL(random()>0.75?0.1:0.58,0.1+random()*0.18,0.73+random()*0.2);
            colors.push(color.r,color.g,color.b);
        }
        const result=new THREE.BufferGeometry();
        result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
        result.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));
        result.setAttribute('phase',new THREE.Float32BufferAttribute(phases,1));
        result.setAttribute('starColor',new THREE.Float32BufferAttribute(colors,3));
        return result;
    },[compact]);
    const uniforms=useMemo(()=>({night:nightMix,time:{value:0}}),[nightMix]);
    useEffect(()=>()=>geometry.dispose(),[geometry]);
    useFrame(({clock})=>{uniforms.time.value=clock.elapsedTime;});
    return <points geometry={geometry}>
        <shaderMaterial uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending}
            vertexShader={`uniform float time;attribute float size;attribute float phase;attribute vec3 starColor;varying float brightness;varying vec3 tint;
            void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;
            gl_PointSize=clamp(size*1200.0/max(1.0,-mv.z),1.0,3.5);brightness=0.65+0.15*sin(time*0.12+phase);tint=starColor;}`}
            fragmentShader={`uniform float night;varying float brightness;varying vec3 tint;
            void main(){float d=length(gl_PointCoord-0.5)*2.0;
            gl_FragColor=vec4(tint,pow(max(0.0,1.0-d),2.0)*brightness*night);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
            }`} />
    </points>;
}
