import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useSceneMotion from './useSceneMotion';

export default function CloudLayers({ nightMix, compact, sunsetMix, narrow }) {
    const ref=useRef();
    const motion=useSceneMotion();
    const layers=useMemo(()=>[
        [-240,-49,-295,250,35],[210,-59,-305,290,30],[-25,-59,-390,540,45],
        [-50,-39,-148,240,16],[140,-94,-235,460,56],[-240,-114,-275,440,50],
    ].slice(0,compact?4:6),[compact]);
    const uniforms=useMemo(()=>({time:{value:0},night:nightMix,sunset:sunsetMix||{value:0}}),[nightMix,sunsetMix]);
    useLayoutEffect(()=>{
        const dummy=new THREE.Object3D();layers.forEach(([x,y,z,w,h],i)=>{
            dummy.position.set(x,y,z);dummy.scale.set(w,h,1);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix);
        });ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();
    },[layers]);
    useFrame((_,delta)=>{
        if(!document.hidden&&!motion.current.reduced)motion.current.time+=Math.min(delta,.05);
        uniforms.time.value=motion.current.time;
    });
    return <instancedMesh ref={ref} args={[undefined,undefined,layers.length]} scale={[narrow?0.52:1,1,1]} renderOrder={3}>
        <planeGeometry args={[1,1]} />
        <shaderMaterial uniforms={uniforms} transparent depthWrite={false}
            vertexShader={`uniform float time;varying vec2 vUv;varying float seed;
                void main(){vUv=uv;vec4 p=instanceMatrix*vec4(position,1.0);seed=instanceMatrix[3].x*0.02;
                p.x+=sin(time*0.035+seed)*16.0;p.y+=sin(time*.045+seed)*1.5;gl_Position=projectionMatrix*modelViewMatrix*p;}`}
            fragmentShader={`uniform float time;uniform float night;uniform float sunset;varying vec2 vUv;varying float seed;
                float hash(vec2 p){return fract(sin(dot(p,vec2(17.13,63.17)))*43758.5);}
                float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
                    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
                void main(){vec2 uv=vUv*vec2(8.0,3.0)+vec2(time*0.022,seed);
                    float n=noise(uv)*0.6+noise(uv*2.07)*0.3+noise(uv*4.1)*0.1;
                    float edge=pow(max(0.0,1.0-length((vUv-0.5)*vec2(2.0,2.1))),0.75);
                    float alpha=smoothstep(0.25,0.72,n)*edge*0.48;
                    vec3 color=mix(vec3(0.69,0.79,0.82),vec3(0.11,0.18,0.24),night);
                    color=mix(color,vec3(0.57,0.38,0.35),sunset*0.5);
                    gl_FragColor=vec4(color,alpha);
                    #include <tonemapping_fragment>
                    #include <colorspace_fragment>
                }`} />
    </instancedMesh>;
}
