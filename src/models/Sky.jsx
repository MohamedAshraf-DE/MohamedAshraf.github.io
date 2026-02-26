import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import skyScene from "../assets/3d/sky.glb";

// 3D Model from: https://sketchfab.com/3d-models/phoenix-bird-844ba0cf144a413ea92c779f18912042
export function Sky({ isRotating, theme }) {
    const sky = useGLTF(skyScene);
    const skyRef = useRef();

    // Effect to tint the sky material when in dark mode
    useEffect(() => {
        if (sky.scene) {
            sky.scene.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (theme === "dark") {
                        // Night blue sky tint matching the reference image
                        child.material.color = new THREE.Color('#0a1c4a');
                        // Optional: if the material has emissive properties, we can tune them down
                        if (child.material.emissive) {
                            child.material.emissive = new THREE.Color('#000000');
                        }
                    } else {
                        // Reset to original (white means no tint in Three.js)
                        child.material.color = new THREE.Color('#ffffff');
                    }
                    child.material.needsUpdate = true;
                }
            });
        }
    }, [sky.scene, theme]);

    // Note: Animation names can be found on the Sketchfab website where the 3D model is hosted.
    // It ensures smooth animations by making the rotation frame rate-independent.
    // 'delta' represents the time in seconds since the last frame.
    useFrame((_, delta) => {
        if (isRotating) {
            skyRef.current.rotation.y += 0.25 * delta; // Adjust the rotation speed as needed
        }
    });

    return (
        <mesh ref={skyRef}>
            <primitive object={sky.scene} />
        </mesh>
    );
}