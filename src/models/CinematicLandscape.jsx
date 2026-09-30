import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import useSceneMotion from './useSceneMotion';

const imageAspect = 1672 / 941;

// A camera-projected relief mesh: foreground cliffs, academy, lake, and sky
// occupy different distances. Intended for restrained parallax, not free flight.
function landscapeGeometry(aspect, fov, compact) {
    const geometry = new THREE.PlaneGeometry(2, 2, compact ? 48 : 112, compact ? 28 : 64);
    const position = geometry.attributes.position, uv = geometry.attributes.uv;
    const coverX = Math.max(1, imageAspect / aspect) * 1.06;
    const coverY = Math.max(1, aspect / imageAspect) * 1.06;
    const halfFov = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const framing = aspect < 1 ? 0.32 : 0.5;
    for (let i = 0; i < position.count; i++) {
        const u = uv.getX(i), v = uv.getY(i);
        const skyline = THREE.MathUtils.smoothstep(v, 0.69, 0.87);
        const castle = Math.exp(-Math.pow((u - 0.23) / 0.25, 4)) * (1 - skyline);
        const terrainDepth = 100 + Math.pow(v, 1.6) * 650;
        const depth = THREE.MathUtils.lerp(terrainDepth * (1 - castle * 0.44), 1180, skyline);
        position.setXYZ(i, (u - framing) * 2 * halfFov * aspect * coverX * depth,
            (v - 0.5) * 2 * halfFov * coverY * depth, 5 - depth);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals(); geometry.computeBoundingSphere();
    return geometry;
}

export default function CinematicLandscape({ nightMix, sunsetMix, compact = false }) {
    const textures = useTexture(['/scene-assets/academy/day.webp','/scene-assets/academy/night.webp','/scene-assets/academy/motion-mask.svg']);
    const motion = useSceneMotion();
    const { size, camera } = useThree();
    const geometry = useMemo(() => landscapeGeometry(size.width / size.height, camera.fov,compact), [size.width, size.height, camera.fov,compact]);
    const uniforms = useMemo(() => {
        textures.slice(0, 2).forEach(texture => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; });
        textures[2].colorSpace = THREE.NoColorSpace;
        return { dayMap: { value: textures[0] }, nightMap: { value: textures[1] }, motionMask: { value: textures[2] }, night: nightMix, sunset: sunsetMix, time: { value: 0 } };
    }, [textures, nightMix, sunsetMix]);
    useEffect(() => () => geometry.dispose(), [geometry]);
    useFrame((_, delta) => {
        if (!document.hidden && !motion.current.reduced) motion.current.time += Math.min(delta, .05);
        uniforms.time.value = motion.current.time;
    });
    return <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial uniforms={uniforms} toneMapped={false}
            vertexShader={`varying vec2 landscapeUv;
                void main(){landscapeUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
            fragmentShader={`uniform sampler2D dayMap;uniform sampler2D nightMap;uniform sampler2D motionMask;
                uniform float night;uniform float sunset;uniform float time;varying vec2 landscapeUv;
                void main(){vec2 uv=landscapeUv;
                    vec2 mask=texture2D(motionMask,uv).rg;
                    float lake=mask.r;
                    float perspective=mix(.3,1.0,1.0-uv.y);
                    float wave=sin(uv.y*540.0+time*1.9+sin(uv.x*63.0-time*.32)*2.0);
                    float crossWave=sin(uv.y*293.0-uv.x*42.0-time*1.25);
                    uv.x+=(wave*.00115+crossWave*.0006)*lake*perspective;
                    uv.y+=sin(uv.x*118.0+uv.y*96.0-time*1.6)*.00065*lake*perspective;
                    // Drift only inside the sky mask; building and ridge pixels stay fixed.
                    uv.x+=(sin(time*.09+uv.y*5.0)*.008+sin(time*.037)*.003)*mask.g;
                    uv.y+=sin(time*.055+uv.x*8.0)*.0018*mask.g;
                    vec3 day=texture2D(dayMap,uv).rgb;
                    vec3 moon=texture2D(nightMap,uv).rgb;
                    vec3 color=mix(day,moon,night);
                    color=mix(color,color*vec3(1.15,.76,.58),sunset*.65);
                    float glint=pow(max(0.0,wave*.55+crossWave*.45),9.0)*lake;
                    float reflection=exp(-pow((landscapeUv.x-.685)/.09,2.0));
                    color+=mix(vec3(.075,.095,.105),vec3(.035,.060,.085),night)*glint*(.3+reflection*.7);
                    gl_FragColor=vec4(color,1.0);
                    #include <colorspace_fragment>
                }`} />
    </mesh>;
}
