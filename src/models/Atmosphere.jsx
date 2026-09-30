import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `varying vec3 skyDirection;
void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragmentShader = `
varying vec3 skyDirection;
uniform float time;
uniform float night;
uniform float sunset;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float n=0.0,a=0.5;for(int i=0;i<5;i++){n+=noise(p)*a;p=p*2.03+13.1;a*=0.5;}return n;}
void main(){
 vec3 d=normalize(skyDirection);
 float height=smoothstep(-0.22,0.65,d.y);
 vec3 horizon=mix(vec3(0.09,0.32,0.58),vec3(0.025,0.045,0.075),night);
 vec3 zenith=mix(vec3(0.035,0.17,0.40),vec3(0.003,0.008,0.024),night);
 horizon=mix(horizon,vec3(0.64,0.26,0.16),sunset);
 zenith=mix(zenith,vec3(0.08,0.075,0.20),sunset);
 vec3 color=mix(horizon,zenith,height);
 vec3 sun=normalize(mix(vec3(-0.55,0.8,-0.18),vec3(-0.79,0.22,-0.57),sunset));
 float glow=pow(max(0.0,dot(d,sun)),24.0);
 color+=vec3(0.10,0.09,0.045)*glow*(1.0-night);
 color+=vec3(0.7,0.32,0.12)*pow(max(0.0,dot(d,sun)),900.0)*(1.0-night);
 vec2 uv=d.xz/(max(d.y+0.65,0.12))*2.1;
 uv.x+=time*0.003;
 float cloud=fbm(uv);
 float cover=smoothstep(mix(0.55,0.48,night),mix(0.75,0.72,night),cloud)*smoothstep(-0.32,0.05,d.y);
 vec3 cloudColor=mix(vec3(0.78,0.85,0.90),vec3(0.065,0.085,0.12),night);
 cloudColor=mix(cloudColor,vec3(0.58,0.32,0.29),sunset);
 color=mix(color,cloudColor,cover*mix(0.62,0.85,night));
 gl_FragColor=vec4(color,1.0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export default function Atmosphere({ nightMix, sunsetMix, hideSky = false }) {
    // Three caches these uniform objects after compiling the shader. Keep their
    // identity stable and update values so theme changes reach the GPU too.
    const uniforms=useMemo(()=>({time:{value:0},night:nightMix,sunset:sunsetMix}),[nightMix,sunsetMix]);
    const fog=useMemo(()=>new THREE.Fog('#203448',200,1650),[]);
    const colors=useMemo(()=>({day:new THREE.Color('#7295aa'),night:new THREE.Color('#203448'),sunset:new THREE.Color('#936f80')}),[]);
    useFrame(({clock})=>{
        uniforms.time.value=clock.elapsedTime;
        fog.color.lerpColors(colors.day,colors.night,nightMix.value);
        fog.color.lerp(colors.sunset,sunsetMix.value);
    });
    return <>
        <primitive attach="fog" object={fog} />
        {!hideSky && <mesh renderOrder={-10}>
            <sphereGeometry args={[1720,32,16]} />
            <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}
                side={THREE.BackSide} depthWrite={false} />
        </mesh>}
        {!hideSky && <mesh position={[-720,480,-1430]}>
            <sphereGeometry args={[49.5,32,24]} />
            <shaderMaterial uniforms={uniforms} transparent depthWrite={false} vertexShader={vertexShader} fragmentShader={`
                uniform float night;varying vec3 skyDirection;
                void main(){
                    vec3 n=normalize(skyDirection);
                    float mottling=sin(n.x*61.0+sin(n.y*29.0))*sin(n.y*73.0+n.z*37.0);
                    float phase=smoothstep(-0.05,0.5,dot(n,normalize(vec3(-0.8,0.3,0.35))));
                    vec3 color=mix(vec3(0.018,0.03,0.055),vec3(0.72,0.79,0.84)*(0.87+0.13*mottling),phase);
                    gl_FragColor=vec4(color,night);
                    #include <tonemapping_fragment>
                    #include <colorspace_fragment>
                }`} />
        </mesh>}
    </>;
}
