import * as THREE from 'three';

// Bend after the instance transform: all leaves in a crown share a breeze,
// while grass bends at its tip and stays rooted in its original position.
export function addWind(material, time, grass = false) {
    material.onBeforeCompile = shader => {
        shader.uniforms.breezeTime = time;
        shader.vertexShader = 'uniform float breezeTime;\n' + shader.vertexShader;
        const displacement = `
            float breeze = sin(breezeTime * 0.8 + mvPosition.x * 0.23 + mvPosition.z * 0.19);
            float flutter = sin(breezeTime * 2.7 + mvPosition.x * 2.1 + mvPosition.z * 1.8);
            float bend = ${grass ? 'position.y * length(instanceMatrix[1].xyz) * 0.45' : '0.10 + max(mvPosition.y, 0.0) * 0.004'};
            mvPosition.x += (breeze + flutter * 0.22) * bend;
            mvPosition.z += cos(breezeTime * 0.65 + mvPosition.z * 0.3) * bend * 0.45;
        `;
        shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>',
            THREE.ShaderChunk.project_vertex.replace('mvPosition = modelViewMatrix * mvPosition;',
                displacement + '\nmvPosition = modelViewMatrix * mvPosition;'));
    };
    material.customProgramCacheKey = () => `island-wind-${grass ? 'grass' : 'leaves'}-v1`;
    return material;
}
