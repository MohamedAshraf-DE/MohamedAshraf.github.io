import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { randomGenerator } from './nature';
import { sceneAsset } from './sceneAssets';

export default function GeologicalBase({ compact = false }) {
    const mesh = useRef();
    const [color, normal] = useTexture([sceneAsset('materials/aerial_rocks_02-Diffuse.webp',compact), sceneAsset(compact?'materials/aerial_rocks_02-Diffuse.webp':'materials/aerial_rocks_02-nor_gl.webp',compact)]);
    const rockCount = compact ? 12 : 22;
    const geometry = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(1, compact ? 1 : 3), p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const r = 1 + Math.sin(x * 13 + z * 7) * Math.cos(y * 12) * .06 + Math.sin(y * 26 + x * 3) * .025;
            p.setXYZ(i, x * r, y * r, z * r);
        }
        geo.computeVertexNormals(); return geo;
    }, [compact]);
    useEffect(() => () => geometry.dispose(), [geometry]);
    useLayoutEffect(() => {
        color.colorSpace = THREE.SRGBColorSpace;
        color.anisotropy = normal.anisotropy = compact ? 1 : 4;
        const random = randomGenerator(243), dummy = new THREE.Object3D();
        for (let i = 0; i < rockCount; i++) {
            const a = i * Math.PI * 2 / rockCount, radius = 16 + random() * 2.5;
            dummy.position.set(Math.cos(a) * radius, -6.2 - random() * 1.5, Math.sin(a) * radius);
            dummy.rotation.set(random() * .22, a, random() * .24);
            dummy.scale.set(3.1 + random() * 1.6, 3.4 + random() * 2.6, 2.7 + random());
            dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix);
            mesh.current.setColorAt(i, new THREE.Color().setScalar(.72 + random() * .17));
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        mesh.current.instanceColor.needsUpdate = true;
        mesh.current.computeBoundingSphere();
    }, [color, normal, compact, rockCount]);
    return <instancedMesh ref={mesh} args={[geometry, undefined, rockCount]} castShadow={!compact} receiveShadow={!compact}>
        <meshStandardMaterial map={color} normalMap={compact?null:normal} normalScale={[.65, .65]} roughness={.96} />
    </instancedMesh>;
}
