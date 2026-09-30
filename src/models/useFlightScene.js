import { useEffect, useLayoutEffect, useMemo } from 'react';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Matrix4, Mesh, PropertyBinding } from 'three';

// Keep the skeleton and animation bindings stable when comparing appearances.
export function useFlightScene(source, enhanced, animations = [], mergeStatic = false) {
    const { scene, meshes, ownedGeometries, ownedMaterials } = useMemo(() => {
        const scene = clone(source);
        const meshes = [],ownedGeometries=[],materialCopies=new Map();
        scene.traverse(child => {
            if (!child.isMesh) return;
            const original = child.material;
            if(!materialCopies.has(original)) materialCopies.set(original,original.clone());
            child.material = materialCopies.get(original);
            meshes.push({ child, original, visible: child.visible });
        });
        if(mergeStatic){
            const animatedNames=new Set(animations.flatMap(clip=>clip.tracks.map(track=>PropertyBinding.parseTrackName(track.name).nodeName)));
            scene.updateMatrixWorld(true);
            const groups=new Map();
            meshes.forEach(record=>{
                const {child,original}=record;
                if(child.isSkinnedMesh || animatedNames.has(child.name) || original.name==='Tooner') return;
                // Merge in the nearest animated ancestor's coordinates. Its motion
                // still drives the merged geometry; nested moving pieces stay separate.
                let anchor=scene;
                for(let node=child.parent;node;node=node.parent){
                    if(animatedNames.has(node.name)){anchor=node;break;}
                }
                if(!groups.has(anchor)) groups.set(anchor,new Map());
                const materials=groups.get(anchor);
                if(!materials.has(original)) materials.set(original,[]);
                materials.get(original).push(record);
            });
            groups.forEach((materials,anchor)=>materials.forEach((records,original)=>{
                if(records.length<2) return;
                const inverseRoot=new Matrix4().copy(anchor.matrixWorld).invert();
                const geometries=records.map(({child})=>{
                    const geometry=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();
                    return geometry.applyMatrix4(new Matrix4().multiplyMatrices(inverseRoot,child.matrixWorld));
                });
                const geometry=mergeGeometries(geometries,false);
                geometries.forEach(item=>item.dispose());
                if(!geometry) return;
                geometry.computeBoundingSphere();ownedGeometries.push(geometry);
                const merged=new Mesh(geometry,materialCopies.get(original));
                merged.name=`static-${original.name}`;
                records.forEach(({child})=>child.removeFromParent());
                anchor.add(merged);meshes.push({child:merged,original,visible:true});
            }));
        }
        return { scene, meshes, ownedGeometries, ownedMaterials:[...materialCopies.values()] };
    }, [source,animations,mergeStatic]);
    useLayoutEffect(() => {
        meshes.forEach(({ child, original, visible }) => {
            child.castShadow = enhanced;
            child.receiveShadow = enhanced;
            child.material.emissiveIntensity = enhanced ? 0.09 : original.emissiveIntensity;
            child.material.roughness = enhanced ? 0.7 : original.roughness;
            child.material.metalness = enhanced ? 0.08 : original.metalness;
            child.visible = enhanced && original.name === 'Tooner' ? false : visible;
        });
    }, [meshes, enhanced]);
    useEffect(() => () => {
        ownedMaterials.forEach(material=>material.dispose());
        ownedGeometries.forEach(geometry=>geometry.dispose());
    }, [ownedMaterials,ownedGeometries]);
    return scene;
}
