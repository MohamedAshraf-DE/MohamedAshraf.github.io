import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { randomGenerator } from './nature';
import { addWind } from './wind';
import { nearVillage } from './villageLayout';
import { sceneAsset } from './sceneAssets';

function Instances({ items, geometry, material, depthMaterial, shadows = false }) {
    const ref = useRef();
    useLayoutEffect(() => {
        const dummy = new THREE.Object3D();
        items.forEach((item, index) => {
            dummy.position.fromArray(item.position);
            dummy.rotation.set(...(item.rotation instanceof Array ? item.rotation : [0,item.rotation,0]));
            if (Array.isArray(item.scale)) dummy.scale.fromArray(item.scale);
            else dummy.scale.setScalar(item.scale);
            dummy.updateMatrix();
            ref.current.setMatrixAt(index,dummy.matrix);
            if(item.color) ref.current.setColorAt(index,item.color);
        });
        ref.current.instanceMatrix.needsUpdate=true;
        if(ref.current.instanceColor) ref.current.instanceColor.needsUpdate=true;
        ref.current.computeBoundingSphere();
    },[items]);
    return <instancedMesh ref={ref} args={[geometry,material,items.length]} customDepthMaterial={depthMaterial} castShadow={shadows} receiveShadow />;
}

export default function NatureDetails({ details, compact }) {
    const windTime = useMemo(() => ({ value: 0 }), []);
    const leaves = useMemo(()=>{
        const random=randomGenerator(321), items=[];
        const leafCount = compact ? 24 : 110;
        details.canopies.filter(({center})=>!nearVillage(center.x,center.z,1)).forEach(({center,size})=>{
            for(let i=0;i<leafCount;i++) {
                const theta=random()*Math.PI*2, z=random()*2-1, radius=Math.cbrt(random());
                const ring=Math.sqrt(1-z*z);
                const position=[center.x+Math.cos(theta)*ring*radius*size.x*0.6,
                    center.y+z*radius*size.y*0.57,center.z+Math.sin(theta)*ring*radius*size.z*0.6];
                const s=(0.58+random()*0.45)*(compact?1.45:1);
                items.push({position,scale:[s,s,1],rotation:[random()*3,random()*6,random()*3],
                    color:new THREE.Color().setHSL(0.18+random()*0.035,0.06+random()*0.06,0.66+random()*0.20)});
            }
        });
        return items;
    },[details,compact]);
    const grass=useMemo(()=>details.grass.filter(({position},index)=>(!compact||index%3===0)&&!nearVillage(position[0],position[2])),[details,compact]);
    const trunks=useMemo(()=>details.canopies.filter(({center,size})=>size.length()>2&&!nearVillage(center.x,center.z,1)).map(({center,size})=>({
        position:[center.x,(center.y-size.y*.16)*.5,center.z],
        scale:[Math.max(.12,size.x*.045),center.y-size.y*.16,Math.max(.12,size.z*.045)],
        rotation:[0,0,0],
    })),[details]);
    const resources=useMemo(()=>{
        const foliage=new THREE.TextureLoader().load(sceneAsset('materials/hornbeam.webp',compact));
        foliage.colorSpace=THREE.SRGBColorSpace;foliage.anisotropy=compact?1:4;
        const grassGeo=new THREE.BufferGeometry();
        grassGeo.setAttribute('position',new THREE.Float32BufferAttribute([
            -0.24,0,0, 0.24,0,0, 0.08,1,0.08,
            0,0,-0.24, 0,0,0.24, -0.1,0.8,0.03,
            -0.15,0,-0.15, 0.15,0,0.15, 0.25,0.65,0.1],3));
        grassGeo.computeVertexNormals();
        return {
            foliage,
            trunkGeo:new THREE.CylinderGeometry(.7,1,1,8),
            trunkMat:new THREE.MeshStandardMaterial({color:'#514736',roughness:1}),
            leafGeo:new THREE.PlaneGeometry(2,2),
            leafMat:addWind(new THREE.MeshStandardMaterial({color:'white',map:foliage,alphaTest:.45,side:THREE.DoubleSide,roughness:.94}),windTime),
            leafDepth:addWind(new THREE.MeshDepthMaterial({map:foliage,alphaTest:.45,depthPacking:THREE.RGBADepthPacking}),windTime),
            grassGeo,grassMat:addWind(new THREE.MeshStandardMaterial({color:'#87965b',roughness:1,side:THREE.DoubleSide}),windTime,true),
            rockGeo:new THREE.IcosahedronGeometry(1,1),
            rockMat:new THREE.MeshStandardMaterial({color:'#777665',roughness:1})
        };
    },[windTime,compact]);
    useEffect(() => () => Object.values(resources).forEach(resource => resource.dispose()), [resources]);
    useFrame(({clock})=>{
        windTime.value=clock.elapsedTime;
    });
    return <>
        <Instances items={trunks} geometry={resources.trunkGeo} material={resources.trunkMat} shadows={!compact} />
        <Instances items={leaves} geometry={resources.leafGeo} material={resources.leafMat} depthMaterial={resources.leafDepth} shadows={!compact} />
        <Instances items={grass} geometry={resources.grassGeo} material={resources.grassMat} shadows={false} />
        <Instances items={details.rocks} geometry={resources.rockGeo} material={resources.rockMat} shadows={!compact} />
    </>;
}
