import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useFantasyGeometry from './useFantasyGeometry';
import { createForestTexture } from './forestTexture';

const dayTint=new THREE.Color('#ffffff'),nightTint=new THREE.Color('#7398b5');
const dayWindow=new THREE.Color('#302c27'),nightWindow=new THREE.Color('#ffd5a0');
const sunsetTint=new THREE.Color('#d3ad9b');

const surfaceNoise=`
varying vec3 academyPosition;
varying vec3 academyNormal;
float aHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float aNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(aHash(i),aHash(i+vec3(1,0,0)),f.x),mix(aHash(i+vec3(0,1,0)),aHash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(aHash(i+vec3(0,0,1)),aHash(i+vec3(1,0,1)),f.x),mix(aHash(i+vec3(0,1,1)),aHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec2 aProjection(){vec3 n=abs(academyNormal);return n.y>max(n.x,n.z)?academyPosition.xz:(n.z>n.x?academyPosition.xy:academyPosition.zy);}
vec3 aBump(vec3 n,float h){vec3 x=dFdx(-vViewPosition),y=dFdy(-vViewPosition),r1=cross(y,n),r2=cross(n,x);
 float det=dot(x,r1);return normalize(abs(det)*n-sign(det)*(dFdx(h)*r1+dFdy(h)*r2));}
`;

function finishSurface(material,type){
    material.onBeforeCompile=shader=>{
        shader.vertexShader='varying vec3 academyPosition;varying vec3 academyNormal;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n academyPosition=position;academyNormal=normal;');
        shader.fragmentShader=shader.fragmentShader.replace('void main() {',surfaceNoise+'\nvoid main() {');
        let surface;
        if(type==='stone'||type==='trim')surface=`
            vec2 masonry=aProjection()*vec2(0.32,0.48);
            masonry.x+=mod(floor(masonry.y),2.0)*0.5;
            vec2 brick=fract(masonry);
            float edge=min(min(brick.x,1.0-brick.x),min(brick.y,1.0-brick.y));
            float mortar=1.0-smoothstep(0.018,0.052,edge);
            float grain=aNoise(academyPosition*2.8);
            float weather=aNoise(academyPosition*.07);
            float tile=aHash(vec3(floor(masonry),0.0));
            diffuseColor.rgb*=0.72+0.18*grain+0.23*weather+tile*0.09-mortar*0.15;
            float surfaceHeight=(grain*.10-mortar*.07);`;
        else if(type==='roof')surface=`
            vec2 shingles=aProjection()*vec2(.65,1.4);
            shingles.x+=mod(floor(shingles.y),2.0)*.5;
            vec2 tile=fract(shingles);
            float seam=1.0-smoothstep(.015,.07,min(min(tile.x,1.0-tile.x),tile.y));
            float grain=aNoise(academyPosition*3.0);
            diffuseColor.rgb*=.69+grain*.24+aHash(vec3(floor(shingles),0.0))*.21-seam*.17;
            float surfaceHeight=grain*.05-seam*.12;`;
        else surface=`
            float broad=aNoise(academyPosition*.045),grain=aNoise(academyPosition*.65);
            float rock=smoothstep(.16,.50,1.0-abs(academyNormal.y));
            diffuseColor.rgb*=.78+broad*.24+grain*.14;
            diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.05,.98,.92),rock*.55);
            float surfaceHeight=grain*.22;`;
        shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+surface);
        shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n normal=aBump(normal,surfaceHeight);');
    };
    material.customProgramCacheKey=()=>`academy-surface-v3-${type}`;
}

function lakeMaterial(time,night,sunset){
    return new THREE.ShaderMaterial({fog:true,uniforms:{...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),lakeTime:time,lakeNight:night,lakeSunset:sunset},
        vertexShader:`varying vec3 lakePosition;
            #include <fog_pars_vertex>
            void main(){lakePosition=(modelMatrix*vec4(position,1.0)).xyz;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);
                gl_Position=projectionMatrix*mvPosition;
                #include <fog_vertex>
            }`,
        fragmentShader:`uniform float lakeTime;uniform float lakeNight;uniform float lakeSunset;varying vec3 lakePosition;
            #include <fog_pars_fragment>
            void main(){vec2 p=lakePosition.xz;
                vec3 n=normalize(vec3(cos(p.x*.2+lakeTime*.24)*.035,1.0,sin(p.y*.17-lakeTime*.19)*.028));
                vec3 v=normalize(cameraPosition-lakePosition),r=reflect(-v,n);
                float fresnel=.05+.58*pow(1.0-max(0.0,dot(n,v)),4.0);
                vec3 deep=mix(vec3(.015,.065,.085),vec3(.004,.012,.026),lakeNight);
                vec3 sky=mix(vec3(.18,.36,.45),vec3(.025,.06,.11),lakeNight);
                sky=mix(sky,vec3(.27,.14,.15),lakeSunset*.55);
                float sparkle=pow(max(0.0,dot(r,normalize(vec3(-.55,.5,-.65)))),130.0);
                vec3 color=mix(deep,sky,fresnel)+sparkle*mix(vec3(.26,.27,.22),vec3(.035,.055,.08),lakeNight);
                gl_FragColor=vec4(color,1.0);
                #include <tonemapping_fragment>
                #include <colorspace_fragment>
                #include <fog_fragment>
            }`,side:THREE.DoubleSide});
}

export default function FantasyWorld({ nightMix, sunsetMix, compact, narrow }) {
    const geometry=useFantasyGeometry(compact);
    const time=useMemo(()=>({value:0}),[]);
    const forestTexture=useMemo(()=>createForestTexture(),[]);
    useEffect(()=>()=>forestTexture.dispose(),[forestTexture]);
    const materials=useMemo(()=>{
        const result={};Object.keys(geometry).forEach(type=>{
            if(type==='water'){result[type]=lakeMaterial(time,nightMix,sunsetMix);return;}
            result[type]=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.95,metalness:0,
                side:THREE.DoubleSide,color:'white'});
            if(type==='windows'){result[type].emissive=new THREE.Color('#ffb56b');result[type].emissiveIntensity=0;}
            if(type==='forest'){result[type].map=forestTexture;result[type].alphaTest=.45;}
            if(type!=='forest'&&type!=='windows')finishSurface(result[type],type);
        });return result;
    },[geometry,time,nightMix,sunsetMix,forestTexture]);
    useEffect(()=>()=>Object.values(materials).forEach(m=>m.dispose()),[materials]);
    useFrame(({clock})=>{
        time.value=clock.elapsedTime;
        Object.entries(materials).forEach(([type,material])=>{
            if(type==='water')return;
            if(type==='windows'){
                const illumination=Math.max(nightMix.value,sunsetMix.value*0.42);
                material.color.lerpColors(dayWindow,nightWindow,illumination);
                material.emissiveIntensity=illumination*(1.8+0.04*Math.sin(clock.elapsedTime*0.35));
            }else{
                material.color.lerpColors(dayTint,nightTint,nightMix.value*0.42);
                material.color.lerp(sunsetTint,sunsetMix.value*0.4);
            }
        });
    });
    return <group scale={[narrow?0.52:1,1,1]}>{Object.entries(geometry).map(([type,geo])=><mesh key={type} geometry={geo} material={materials[type]} />)}</group>;
}

export function WorldCamera() {
    const target=useMemo(()=>new THREE.Vector3(0,0,-43),[]),pointer=useRef({x:0,y:0});
    useEffect(()=>{
        const move=event=>{if(event.pointerType==='touch')return;
            pointer.current.x=(event.clientX/window.innerWidth-0.5)*2;
            pointer.current.y=(0.5-event.clientY/window.innerHeight)*2;};
        const leave=()=>{pointer.current.x=0;pointer.current.y=0;};
        window.addEventListener('pointermove',move);window.addEventListener('blur',leave);
        return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('blur',leave);};
    },[]);
    useFrame(({camera},delta)=>{
        camera.position.x=THREE.MathUtils.damp(camera.position.x,pointer.current.x*1.4,2.5,Math.min(delta,0.05));
        camera.position.y=THREE.MathUtils.damp(camera.position.y,pointer.current.y*0.4,2.5,Math.min(delta,0.05));
        camera.lookAt(target);
    });
    return null;
}
