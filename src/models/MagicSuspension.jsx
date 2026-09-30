import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { randomGenerator } from './nature';

function crystalGeometry() {
    const vertices=[],indices=[];
    const rings=[[0,1.45],[-1.4,2.05],[-5.2,1.05]];
    rings.forEach(([y,r])=>{for(let i=0;i<6;i++){const a=i*Math.PI/3;vertices.push(Math.cos(a)*r,y,Math.sin(a)*r);}});
    vertices.push(0,1.6,0,0,-8.2,0);
    for(let i=0;i<6;i++){
        const next=(i+1)%6;indices.push(18,next,i,19,12+i,12+next);
        for(let ring=0;ring<2;ring++){const a=ring*6+i,b=ring*6+next;indices.push(a,b,a+6,b,b+6,a+6);}
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);
    const result=geometry.toNonIndexed();result.computeVertexNormals();geometry.dispose();
    const positions=result.attributes.position,colors=[];
    for(let i=0;i<positions.count;i++){
        const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
        const facet=0.68+0.32*(0.5+0.5*Math.cos(Math.atan2(z,x)*3+y*0.17));
        colors.push(0.20*facet,0.43*facet,0.41*facet);
    }
    result.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return result;
}

export default function MagicSuspension({ nightMix, compact }) {
    const crystal=useRef(),ring=useRef(),fragments=useRef(),aura=useRef();
    const resources=useMemo(()=>({crystal:crystalGeometry(),stone:new THREE.IcosahedronGeometry(1,1)}),[]);
    const stones=useMemo(()=>{
        const random=randomGenerator(1903);
        return Array.from({length:compact?6:10},(_,i)=>({angle:i*6.283/(compact?6:10),radius:4.8+random()*3,
            height:-3-random()*5,size:0.4+random()*0.8,phase:random()*6.28}));
    },[compact]);
    const particleGeometry=useMemo(()=>{
        const random=randomGenerator(41),positions=[],phases=[];
        for(let i=0;i<(compact?28:60);i++){const a=random()*6.28,r=1+random()*7;
            positions.push(Math.cos(a)*r,-random()*10,Math.sin(a)*r);phases.push(random()*6.28);}
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
        geo.setAttribute('phase',new THREE.Float32BufferAttribute(phases,1));return geo;
    },[compact]);
    const uniforms=useMemo(()=>({time:{value:0},night:nightMix}),[nightMix]);
    const dummy=useMemo(()=>new THREE.Object3D(),[]);
    useEffect(()=>()=>{Object.values(resources).forEach(r=>r.dispose());},[resources]);
    useEffect(()=>()=>particleGeometry.dispose(),[particleGeometry]);
    useFrame(({clock})=>{
        const time=clock.elapsedTime;uniforms.time.value=time;
        crystal.current.emissiveIntensity=(0.18+0.20*nightMix.value)*(0.93+Math.sin(time*0.65)*0.07);
        aura.current.opacity=0.10+nightMix.value*0.10;
        ring.current.rotation.y=time*0.025;
        stones.forEach((stone,i)=>{
            const angle=stone.angle+time*0.018;
            dummy.position.set(Math.cos(angle)*stone.radius,stone.height+Math.sin(time*0.3+stone.phase)*0.22,Math.sin(angle)*stone.radius);
            dummy.rotation.set(stone.phase,time*0.03+stone.phase,0.3);dummy.scale.set(stone.size,stone.size*1.25,stone.size);
            dummy.updateMatrix();fragments.current.setMatrixAt(i,dummy.matrix);
        });
        fragments.current.instanceMatrix.needsUpdate=true;
    });
    return <group position={[0,-10,0]}>
        {/* The upper facets penetrate the rock; the crystal is never a detached ornament. */}
        <mesh geometry={resources.crystal} scale={[1.55,1.65,1.55]}><meshStandardMaterial ref={crystal} vertexColors color="#ffffff" emissive="#3eaaa5"
            emissiveIntensity={0.18} metalness={0.28} roughness={0.32} flatShading /></mesh>
        <mesh geometry={resources.crystal} scale={[1.65,1.76,1.65]}><meshBasicMaterial ref={aura} color="#79bbb0" transparent opacity={0.1}
            depthWrite={false} side={THREE.BackSide} /></mesh>
        <instancedMesh ref={fragments} args={[resources.stone,undefined,stones.length]} frustumCulled={false}>
            <meshStandardMaterial color="#555e58" roughness={0.98} flatShading />
        </instancedMesh>
        <group ref={ring} position={[0,-7,0]} rotation={[0.12,0,0]}>
            {[4.1,5.8].map((radius,i)=><mesh key={radius} rotation={[Math.PI/2,0,i*0.25]}>
                <torusGeometry args={[radius,0.025,4,compact?40:64,Math.PI*1.55]} />
                <meshStandardMaterial color="#a39770" emissive="#467d77" emissiveIntensity={0.3} metalness={0.6} roughness={0.6} />
            </mesh>)}
        </group>
        <points geometry={particleGeometry} frustumCulled={false}>
            <shaderMaterial uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending}
                vertexShader={`uniform float time;attribute float phase;varying float brightness;
                    void main(){vec3 p=position;p.y+=sin(time*0.3+phase)*0.5;p.x+=sin(time*0.12+phase)*0.3;
                    vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;
                    gl_PointSize=clamp(85.0/max(1.0,-mv.z),1.0,3.0);brightness=0.4+0.3*sin(time*0.5+phase);}`}
                fragmentShader={`uniform float night;varying float brightness;
                    void main(){float r=length(gl_PointCoord-0.5)*2.0;
                    gl_FragColor=vec4(0.58,0.81,0.75,pow(max(0.0,1.0-r),2.0)*brightness*(0.4+0.6*night));}`} />
        </points>
    </group>;
}
