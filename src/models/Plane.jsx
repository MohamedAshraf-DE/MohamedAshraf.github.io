import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createAircraftGeometry, createAircraftPath } from './aircraftGeometry';

function NavigationLights({ nightMix }) {
    const materials=useMemo(()=>['#ff3434','#69d795','#f0e5c9'].map(color=>{
        const material=new THREE.MeshBasicMaterial({color,toneMapped:false});material.userData.base=new THREE.Color(color);return material;
    }),[]);
    useEffect(()=>()=>materials.forEach(m=>m.dispose()),[materials]);
    useFrame(()=>{materials.forEach(m=>{m.color.copy(m.userData.base).multiplyScalar(0.8+nightMix.value*1.7);});});
    // Forward is +Z: port (left to the pilot) is +X, starboard is -X.
    return <>{[[6.68,-0.14,-0.47],[-6.68,-0.14,-0.47],[0,0.4,-4.66]].map((p,i)=><mesh key={i} position={p} material={materials[i]}>
        <sphereGeometry args={[0.095,8,6]} />
    </mesh>)}</>;
}

export function Plane({ isRotating, nightMix, narrow = false, compact = false }) {
    const ref=useRef(),propeller=useRef(),cockpit=useRef(),progress=useRef(0.02),speed=useRef(1);
    const geometry=useMemo(()=>createAircraftGeometry(),[]),curve=useMemo(()=>createAircraftPath(narrow),[narrow]);
    const materials=useMemo(()=>{const result={
        paint:new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.48,metalness:0.35}),
        metal:new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.32,metalness:0.72}),
        rubber:new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.93}),
    };
        result.paint.onBeforeCompile=shader=>{
            shader.vertexShader='varying vec3 aircraftPosition;\n'+shader.vertexShader;
            shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n aircraftPosition=position;');
            shader.fragmentShader='varying vec3 aircraftPosition;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
                float grain=fract(sin(dot(floor(aircraftPosition*90.0),vec3(17.1,31.7,63.1)))*43758.5);
                float belly=1.0-smoothstep(-0.4,-0.1,aircraftPosition.y);
                diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.48,0.53,0.48),belly*0.35);
                diffuseColor.rgb*=0.94+grain*0.10;`);
        };
        result.paint.customProgramCacheKey=()=> 'vintage-aircraft-paint-v1';return result;
    },[]);
    const motion=useMemo(()=>({point:new THREE.Vector3(),forward:new THREE.Vector3(),ahead:new THREE.Vector3(),right:new THREE.Vector3(),
        up:new THREE.Vector3(),worldUp:new THREE.Vector3(0,1,0),rollAxis:new THREE.Vector3(0,0,1),matrix:new THREE.Matrix4(),
        orientation:new THREE.Quaternion(),roll:new THREE.Quaternion()}),[]);
    const uniforms=useMemo(()=>({time:{value:0}}),[]);
    useEffect(()=>()=>{Object.values(geometry).forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose());},[geometry,materials]);
    useFrame(({clock},delta)=>{
        const dt=Math.min(delta,0.05);speed.current=THREE.MathUtils.damp(speed.current,isRotating?1.12:1,2,dt);
        progress.current=(progress.current+dt*speed.current/74)%1;
        const u=progress.current;curve.getPointAt(u,motion.point);curve.getTangentAt(u,motion.forward);
        curve.getTangentAt((u+0.012)%1,motion.ahead);
        motion.right.crossVectors(motion.worldUp,motion.forward).normalize();motion.up.crossVectors(motion.forward,motion.right).normalize();
        motion.matrix.makeBasis(motion.right,motion.up,motion.forward);motion.orientation.setFromRotationMatrix(motion.matrix);
        const turn=motion.forward.x*motion.ahead.z-motion.forward.z*motion.ahead.x;
        motion.roll.setFromAxisAngle(motion.rollAxis,THREE.MathUtils.clamp(turn*5,-0.48,0.48));
        motion.orientation.multiply(motion.roll);ref.current.position.copy(motion.point);ref.current.quaternion.copy(motion.orientation);
        propeller.current.rotation.z+=dt*55;uniforms.time.value=clock.elapsedTime;
        cockpit.current.emissiveIntensity=nightMix.value*0.9;
    });
    return <group ref={ref} scale={narrow?0.58:0.96}>
        {Object.entries(geometry).map(([type,g])=><mesh key={type} geometry={g} material={materials[type]} castShadow={!compact&&type==='paint'} />)}
        <mesh position={[0,0.68,-0.04]} scale={[0.61,0.53,1.12]}>
            <sphereGeometry args={[1,24,12,0,Math.PI*2,0,Math.PI/2]} />
            <meshPhysicalMaterial color="#718f8d" roughness={0.13} metalness={0.12} transparent opacity={0.62}
                clearcoat={0.6} clearcoatRoughness={0.14} depthWrite={false} />
        </mesh>
        <mesh position={[0,0.7,0.1]}><boxGeometry args={[0.3,0.04,0.45]} />
            <meshStandardMaterial ref={cockpit} color="#292f2d" emissive="#deb86f" emissiveIntensity={0} />
        </mesh>
        <group ref={propeller} position={[0,0,4.35]}>
            {[0,Math.PI/2].map(a=><mesh key={a} rotation={[0,0,a]}><boxGeometry args={[0.12,3.2,0.045]} />
                <meshStandardMaterial color="#4e5348" metalness={0.4} roughness={0.5} transparent opacity={0.18} /></mesh>)}
        </group>
        <mesh position={[0,0,4.4]}>
            <circleGeometry args={[1.65,32]} />
            <shaderMaterial uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide}
                vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
                fragmentShader={`uniform float time;varying vec2 vUv;void main(){vec2 p=vUv-0.5;float r=length(p)*2.0;
                    float sweep=0.75+0.25*sin(atan(p.y,p.x)*4.0-time*55.0);
                    gl_FragColor=vec4(0.49,0.53,0.46,smoothstep(0.12,0.4,r)*(1.0-smoothstep(0.78,1.0,r))*0.12*sweep);}`} />
        </mesh>
        <NavigationLights nightMix={nightMix} />
    </group>;
}
