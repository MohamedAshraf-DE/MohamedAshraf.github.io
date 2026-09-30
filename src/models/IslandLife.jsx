import { useEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { randomGenerator } from './nature';

function groundNear(grass, x, z) {
    let nearest=[x,0,z],distance=Infinity;
    grass.forEach(({position})=>{
        const d=(position[0]-x)**2+(position[2]-z)**2;
        if(d<distance){distance=d;nearest=position;}
    });
    return [nearest[0],nearest[1]+0.1,nearest[2]];
}

const lanternDay=new THREE.Color('#bdac7c'),lanternNight=new THREE.Color('#ffda8c');

function Lantern({ position, nightMix, light = false }) {
    const glass=useRef(),lamp=useRef();
    const uniforms=useMemo(()=>({night:nightMix}),[nightMix]);
    useFrame(()=>{
        glass.current.color.lerpColors(lanternDay,lanternNight,nightMix.value);
        glass.current.emissiveIntensity=2.4*nightMix.value;
        if(lamp.current) lamp.current.intensity=14*nightMix.value;
    });
    return <group position={position}>
        <mesh position={[0,0.9,0]} castShadow><cylinderGeometry args={[0.055,0.08,1.8,8]} /><meshStandardMaterial color="#3e4840" roughness={0.7} /></mesh>
        <mesh position={[0,1.8,0]}><boxGeometry args={[0.34,0.45,0.34]} />
            <meshStandardMaterial ref={glass} color="#bdac7c" emissive="#ffaf46" emissiveIntensity={0} roughness={0.4} /></mesh>
        <mesh position={[0,2.09,0]} castShadow><coneGeometry args={[0.34,0.23,4]} /><meshStandardMaterial color="#3e4840" /></mesh>
        <mesh position={[0,1.54,0]}><boxGeometry args={[0.44,0.1,0.44]} /><meshStandardMaterial color="#3e4840" /></mesh>
        <>
            {light&&<pointLight ref={lamp} position={[0,1.9,0]} color="#ffb866" intensity={0} distance={10} decay={2} />}
            <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.045,0]}>
                <planeGeometry args={[4,4]} />
                <shaderMaterial uniforms={uniforms} transparent depthWrite={false} vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
                    fragmentShader={`uniform float night;varying vec2 vUv;void main(){float glow=pow(max(0.0,1.0-length(vUv-0.5)*2.0),2.0);gl_FragColor=vec4(1.0,0.61,0.23,glow*0.24*night);}`} />
            </mesh>
        </>
    </group>;
}

function Fireflies({ grass, compact, nightMix }) {
    const time=useMemo(()=>({value:0}),[]);
    const geometry=useMemo(()=>{
        const random=randomGenerator(522),positions=[],phases=[];
        for(let i=0;i<(compact?24:56);i++){
            const p=grass[Math.floor(random()*grass.length)]?.position||[0,0,0];
            positions.push(p[0],p[1]+1+random()*3,p[2]);phases.push(random()*6.28);
        }
        const result=new THREE.BufferGeometry();
        result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
        result.setAttribute('phase',new THREE.Float32BufferAttribute(phases,1));
        return result;
    },[grass,compact]);
    const uniforms=useMemo(()=>({time,night:nightMix}),[time,nightMix]);
    useEffect(()=>()=>geometry.dispose(),[geometry]);
    useFrame(({clock})=>{time.value=clock.elapsedTime;});
    return <points geometry={geometry}>
        <shaderMaterial uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending}
            vertexShader={`uniform float time;attribute float phase;varying float light;
            void main(){vec3 p=position;p.x+=sin(time*0.38+phase)*0.8;p.z+=cos(time*0.27+phase)*0.9;p.y+=sin(time*0.7+phase)*0.4;
            vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=min(9.0,210.0/max(1.0,-mv.z));
            light=0.25+0.75*pow(0.5+0.5*sin(time*1.2+phase),2.0);}`}
            fragmentShader={`uniform float night;varying float light;void main(){float radius=length(gl_PointCoord-0.5)*2.0;
            gl_FragColor=vec4(1.0,0.83,0.33,pow(max(0.0,1.0-radius),2.0)*light*night);}`} />
    </points>;
}

export default function IslandLife({ details, nightMix, compact }) {
    const windowMaterial=useRef();
    useFrame(()=>{windowMaterial.current.emissiveIntensity=1.8*nightMix.value;});
    const layout=useMemo(()=>{
        const grass=details.grass;
        const observatory=groundNear(grass,3,-13),mailbox=groundNear(grass,14,3);
        return {observatory,mailbox,
            lanterns:[[12,-3],[9,5],[4,-11],[-9,5]].map(([x,z])=>groundNear(grass,x,z))};
    },[details]);
    return <>
        <group position={layout.observatory}>
            <mesh position={[0,1.25,0]} castShadow receiveShadow><cylinderGeometry args={[1.5,1.8,2.5,24]} /><meshStandardMaterial color="#c6b794" roughness={0.9} /></mesh>
            <mesh position={[0,2.5,0]} castShadow><sphereGeometry args={[1.6,32,16,0,Math.PI*2,0,Math.PI/2]} /><meshStandardMaterial color="#527a76" metalness={0.35} roughness={0.55} /></mesh>
            <mesh position={[0,2.48,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[1.57,0.09,8,32]} /><meshStandardMaterial color="#bca36d" metalness={0.55} roughness={0.4} /></mesh>
            <group position={[0.7,3,0]} rotation={[0,0,-1.05]}>
                <mesh position={[0,0.8,0]} castShadow><cylinderGeometry args={[0.25,0.34,2.2,16]} /><meshStandardMaterial color="#ae9361" metalness={0.65} roughness={0.35} /></mesh>
                <mesh position={[0,1.91,0]}><cylinderGeometry args={[0.2,0.2,0.03,16]} /><meshStandardMaterial color="#102c3c" metalness={0.6} roughness={0.1} /></mesh>
            </group>
            <mesh position={[1.5,1.4,0]} rotation={[0,Math.PI/2,0]}><circleGeometry args={[0.4,24]} /><meshStandardMaterial ref={windowMaterial} color="#c7d4ce" emissive="#ffb64c" emissiveIntensity={0} /></mesh>
        </group>
        <group position={layout.mailbox} rotation={[0,Math.PI/2,0]}>
            <mesh position={[0,0.85,0]} castShadow><cylinderGeometry args={[0.11,0.15,1.7,10]} /><meshStandardMaterial color="#705137" roughness={0.9} /></mesh>
            <RoundedBox args={[0.85,0.7,1.3]} radius={0.16} smoothness={3} position={[0,1.95,0]} castShadow>
                <meshStandardMaterial color="#953f32" metalness={0.2} roughness={0.6} />
            </RoundedBox>
            <mesh position={[0,2.03,0.66]}><boxGeometry args={[0.55,0.055,0.015]} /><meshStandardMaterial color="#24262b" /></mesh>
            <mesh position={[0,1.82,0.67]}><planeGeometry args={[0.38,0.2]} /><meshStandardMaterial color="#ecd9af" /></mesh>
            <mesh position={[0.49,2.37,0]}><boxGeometry args={[0.05,0.72,0.09]} /><meshStandardMaterial color="#b89b54" metalness={0.5} /></mesh>
            <mesh position={[0.49,2.65,0.2]}><boxGeometry args={[0.06,0.22,0.45]} /><meshStandardMaterial color="#d4b76b" /></mesh>
        </group>
        {layout.lanterns.map((position,index)=><Lantern key={index} position={position} nightMix={nightMix} light={index<3} />)}
        <Fireflies grass={details.grass} compact={compact} nightMix={nightMix} />
    </>;
}
