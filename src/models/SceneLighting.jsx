import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, MathUtils } from 'three';

const daySky=new Color('#d4eaff'),nightSky=new Color('#94bddd');
const dayGround=new Color('#55503a'),nightGround=new Color('#252c29');
const daylight=new Color('#ffdfaa'),moonlight=new Color('#c1dcff');
const sunsetSky=new Color('#c9a5ad'),sunsetLight=new Color('#ffb270'),sunsetGround=new Color('#574043');

export default function SceneLighting({ environment, nightMix, sunsetMix, compact, target }) {
    const ambient=useRef(),hemisphere=useRef(),sun=useRef(),rim=useRef(),fill=useRef();
    // One shared transition, evaluated before sky/material/particle callbacks.
    useFrame(({scene},delta)=>{
        const destination=environment==='night'?1:environment==='sunset'?0.28:0;
        const sunsetDestination=environment==='sunset'?1:0;
        nightMix.value=MathUtils.damp(nightMix.value,destination,4.5,Math.min(delta,0.1));
        sunsetMix.value=MathUtils.damp(sunsetMix.value,sunsetDestination,4.5,Math.min(delta,0.1));
        if(Math.abs(nightMix.value-destination)<0.001) nightMix.value=destination;
        if(Math.abs(sunsetMix.value-sunsetDestination)<0.001) sunsetMix.value=sunsetDestination;
        const night=nightMix.value,sunset=sunsetMix.value;
        scene.environmentIntensity=MathUtils.lerp(0.22,0.10,night);
        ambient.current.intensity=MathUtils.lerp(0.28,0.24,night);
        hemisphere.current.intensity=MathUtils.lerp(1.15,0.9,night);
        hemisphere.current.color.lerpColors(daySky,nightSky,night);
        hemisphere.current.color.lerp(sunsetSky,sunset);
        hemisphere.current.groundColor.lerpColors(dayGround,nightGround,night);
        hemisphere.current.groundColor.lerp(sunsetGround,sunset);
        sun.current.intensity=MathUtils.lerp(3.0,1.5,night);
        sun.current.color.lerpColors(daylight,moonlight,night);
        sun.current.color.lerp(sunsetLight,sunset);
        sun.current.position.set(MathUtils.lerp(36,40,night),MathUtils.lerp(45,40,night),MathUtils.lerp(-12,-65,night));
        sun.current.position.x=MathUtils.lerp(sun.current.position.x,-90,sunset);
        sun.current.position.y=MathUtils.lerp(sun.current.position.y,25,sunset);
        sun.current.position.z=MathUtils.lerp(sun.current.position.z,-65,sunset);
        rim.current.intensity=MathUtils.lerp(0.55,1.05,night);
        fill.current.intensity=MathUtils.lerp(0.24,1.45,night);
    },-2);
    return <>
        <ambientLight ref={ambient} intensity={0.28} />
        <hemisphereLight ref={hemisphere} color="#d4eaff" groundColor="#55503a" intensity={1.15} />
        <primitive object={target} />
        <directionalLight ref={sun} position={[-30,45,-10]} intensity={3.1} color="#ffdfaa" castShadow
            target={target} shadow-mapSize={compact?[1024,1024]:[2048,2048]}
            shadow-camera-left={-36} shadow-camera-right={36} shadow-camera-top={36} shadow-camera-bottom={-36}
            shadow-camera-near={1} shadow-camera-far={150}
            shadow-normalBias={0.05} shadow-bias={-0.00015} shadow-radius={3} />
        <directionalLight ref={rim} position={[25,12,-70]} target={target} intensity={0.55} color="#a6cddb" />
        <directionalLight ref={fill} position={[0,18,20]} target={target} intensity={0.24} color="#a5c6e4" />
    </>;
}
