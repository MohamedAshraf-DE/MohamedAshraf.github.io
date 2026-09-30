import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { randomGenerator } from './nature';

export default function GeologicalBase() {
    const mesh = useRef();
    const [color, normal] = useTexture(['/scene-assets/materials/aerial_rocks_02-Diffuse.webp', '/scene-assets/materials/aerial_rocks_02-nor_gl.webp']);
    const geometry = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(1, 3), p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const r = 1 + Math.sin(x * 13 + z * 7) * Math.cos(y * 12) * .06 + Math.sin(y * 26 + x * 3) * .025;
            p.setXYZ(i, x * r, y * r, z * r);
        }
        geo.computeVertexNormals(); return geo;
    }, []);
    useEffect(() => () => geometry.dispose(), [geometry]);
    useLayoutEffect(() => {
        color.colorSpace = THREE.SRGBColorSpace;
        color.anisotropy = normal.anisotropy = 4;
        const random = randomGenerator(243), dummy = new THREE.Object3D();
        for (let i = 0; i < 22; i++) {
            const a = i * Math.PI * 2 / 22, radius = 16 + random() * 2.5;
            dummy.position.set(Math.cos(a) * radius, -6.2 - random() * 1.5, Math.sin(a) * radius);
            dummy.rotation.set(random() * .22, a, random() * .24);
            dummy.scale.set(3.1 + random() * 1.6, 3.4 + random() * 2.6, 2.7 + random());
            dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix);
            mesh.current.setColorAt(i, new THREE.Color().setScalar(.72 + random() * .17));
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        mesh.current.instanceColor.needsUpdate = true;
        mesh.current.computeBoundingSphere();
    }, [color, normal]);
    return <instancedMesh ref={mesh} args={[geometry, undefined, 22]} castShadow receiveShadow>
        <meshStandardMaterial map={color} normalMap={normal} normalScale={[.65, .65]} roughness={.96} />
    </instancedMesh>;
}
