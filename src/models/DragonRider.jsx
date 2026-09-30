import { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { CatmullRomCurve3, Euler, MathUtils, Quaternion, Vector3, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import creatureAsset from '../assets/3d/veyr-dragon-rider.glb';

useGLTF.preload(creatureAsset);

export default function DragonRider({ narrow, compact }) {
    const root=useRef(),travel=useRef(.04);
    const { scene:source, animations }=useGLTF(creatureAsset);
    const { scene, materials, skeletons }=useMemo(()=>{
        const scene=clone(source),copies=new Map(),skeletons=new Set(),reviewObjects=[];
        scene.traverse(object=>{
            // The asset's Blender review lights/camera belong to its preview only.
            if(object.isCamera||object.isLight)reviewObjects.push(object);
            if(!object.isMesh)return;
            const copy=original=>{
                if(!copies.has(original)){
                    const material=original.clone();
                    if(original.name.startsWith('Emerald'))material.color.multiplyScalar(1.2);
                    copies.set(original,material);
                }
                return copies.get(original);
            };
            object.material=Array.isArray(object.material)?object.material.map(copy):copy(object.material);
            object.frustumCulled=false;
            object.receiveShadow=true;
            if(object.skeleton)skeletons.add(object.skeleton);
        });
        reviewObjects.forEach(object=>object.removeFromParent());
        return { scene,materials:[...copies.values()],skeletons };
    },[source]);
    const { actions }=useAnimations(animations,scene);
    useEffect(()=>{
        let active=true;
        const texture=new TextureLoader().load('/scene-assets/materials/dragon-scales.webp',()=>{
            if(!active)return;
            materials.filter(m=>m.name.startsWith('Emerald')).forEach(material=>{
                material.map=texture;material.color.set('#c8d5b8');material.roughness=.85;material.metalness=.025;
                material.normalScale.set(.32,.32);
            });
        });
        texture.colorSpace=SRGBColorSpace;texture.flipY=false;
        texture.wrapS=texture.wrapT=RepeatWrapping;texture.anisotropy=4;
        return()=>{active=false;texture.dispose();};
    },[materials]);
    const flight=useMemo(()=>({
        curve:new CatmullRomCurve3([
            [-23,3,-32],[-29,7,-52],[-15,13,-73],[13,10,-76],
            [28,5,-57],[26,0,-31],[8,8,-25],[-9,9,-26]
        ].map(p=>new Vector3(...p)),true,'centripetal',.5),
        direction:new Vector3(),ahead:new Vector3(),orientation:new Euler(0,0,0,'YXZ'),quaternion:new Quaternion(),initialized:false,
    }),[]);
    useEffect(()=>{
        const action=actions[animations[0]?.name];
        action?.reset().setEffectiveTimeScale(.92).fadeIn(.3).play();
        return()=>action?.stop();
    },[actions,animations]);
    useEffect(()=>{scene.traverse(object=>{if(object.isMesh)object.castShadow=!compact;});},[scene,compact]);
    useEffect(()=>()=>{materials.forEach(m=>m.dispose());skeletons.forEach(s=>s.dispose());},[materials,skeletons]);
    useFrame(({size},delta)=>{
        const dt=Math.min(delta,.05),progress=travel.current=(travel.current+dt/72)%1;
        flight.curve.getPointAt(progress,root.current.position);
        flight.curve.getTangentAt(progress,flight.direction);
        flight.curve.getTangentAt((progress+.012)%1,flight.ahead);
        const xScale=narrow?MathUtils.clamp(size.width/size.height*.7,.24,.52):1;
        root.current.position.x*=xScale;
        flight.direction.x*=xScale;flight.direction.normalize();
        flight.ahead.x*=xScale;flight.ahead.normalize();
        const direction=flight.direction,heading=Math.atan2(direction.x,direction.z);
        const turn=MathUtils.euclideanModulo(Math.atan2(flight.ahead.x,flight.ahead.z)-heading+Math.PI,Math.PI*2)-Math.PI;
        flight.orientation.set(-Math.asin(direction.y),heading,MathUtils.clamp(-turn*3.2,-.43,.43));
        flight.quaternion.setFromEuler(flight.orientation);
        if(!flight.initialized){root.current.quaternion.copy(flight.quaternion);flight.initialized=true;}
        else root.current.quaternion.slerp(flight.quaternion,1-Math.exp(-5*dt));
    });
    return <group ref={root} scale={narrow?.62:1.3} position={[-23,3,-32]}>
        <primitive object={scene} dispose={null} />
    </group>;
}
