import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createCastleGeometry } from './castleGeometry';
import { sceneAsset } from './sceneAssets';

function masonryMaterial(map, color, scale) {
    const material = new THREE.MeshStandardMaterial({ color, roughness: .91 });
    material.onBeforeCompile = shader => {
        shader.uniforms.castleMap = { value: map };
        shader.vertexShader = 'varying vec3 castlePosition;varying vec3 castleNormal;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ncastlePosition=position;castleNormal=normal;');
        shader.fragmentShader = 'uniform sampler2D castleMap;varying vec3 castlePosition;varying vec3 castleNormal;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
            vec3 blend=pow(abs(normalize(castleNormal)),vec3(5.0));blend/=max(.001,blend.x+blend.y+blend.z);
            vec3 tex=texture2D(castleMap,castlePosition.zy*${scale}).rgb*blend.x
                +texture2D(castleMap,castlePosition.xz*${scale}).rgb*blend.y
                +texture2D(castleMap,castlePosition.xy*${scale}).rgb*blend.z;
            diffuseColor.rgb*=tex;
            float courses=abs(fract(castlePosition.y*3.2)-.5);
            diffuseColor.rgb*=.86+.14*smoothstep(.015,.05,courses);
        `);
    };
    material.customProgramCacheKey = () => `castle-masonry-${scale}`;
    return material;
}

export default function MiniatureCastle({ nightMix, compact = false, onReady }) {
    const textures = useTexture([sceneAsset('materials/fort-wall-diff.webp',compact), sceneAsset('materials/roof_slates_02-Diffuse.webp',compact)]);
    const resources = useMemo(() => {
        const maps = textures.map(t => { const copy = t.clone(); copy.wrapS = copy.wrapT = THREE.RepeatWrapping; copy.colorSpace = THREE.SRGBColorSpace; copy.anisotropy = 4; copy.needsUpdate = true; return copy; });
        const geometries = createCastleGeometry(compact);
        const materials = {
            stone: masonryMaterial(maps[0], '#d2c6ae', .3),
            trim: masonryMaterial(maps[0], '#e6d6b4', .35),
            roof: masonryMaterial(maps[1], '#677d8a', .4),
            recess: new THREE.MeshStandardMaterial({ color: '#18201e', roughness: .95, side: THREE.DoubleSide }),
            windows: new THREE.MeshStandardMaterial({ color: '#738d8a', emissive: '#ffb85c', emissiveIntensity: 0, roughness: .38, metalness: .25, side: THREE.DoubleSide }),
        };
        return { geometries, materials, maps };
    }, [textures,compact]);
    useEffect(() => { onReady?.(); }, [onReady]);
    useEffect(() => () => {
        Object.values(resources.geometries).forEach(g => g.dispose());
        Object.values(resources.materials).forEach(m => m.dispose());
        resources.maps.forEach(t => t.dispose());
    }, [resources]);
    useFrame(() => { resources.materials.windows.emissiveIntensity = nightMix.value * 2.1; });
    return <group name="Miniature academy castle" position={[0, 1.1, 0]} rotation={[0, Math.PI / 2 + .42, 0]}>
        {Object.entries(resources.geometries).map(([kind, geometry]) =>
            <mesh key={kind} geometry={geometry} material={resources.materials[kind]} castShadow={kind !== 'windows'} receiveShadow dispose={null} />)}
    </group>;
}
