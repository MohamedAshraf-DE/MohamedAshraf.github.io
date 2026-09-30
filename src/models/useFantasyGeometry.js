import { useEffect, useRef, useState } from 'react';
import { BufferAttribute, BufferGeometry } from 'three';
import { createFantasyWorld } from './fantasyWorldGeometry.js';

const ready=new Map(),pending=new Map();
function reconstruct(surfaces){
    return Object.fromEntries(Object.entries(surfaces).map(([name,attributes])=>{
        const geometry=new BufferGeometry();
        Object.entries(attributes).forEach(([key,{array,itemSize,normalized}])=>geometry.setAttribute(key,new BufferAttribute(array,itemSize,normalized)));
        geometry.computeBoundingSphere();return [name,geometry];
    }));
}
function request(compact){
    if(ready.has(compact))return Promise.resolve(ready.get(compact));
    if(pending.has(compact))return pending.get(compact);
    const promise=new Promise((resolve,reject)=>{
        const worker=new Worker(new URL('./fantasyWorld.worker.js',import.meta.url),{type:'module'});
        worker.onmessage=({data})=>{worker.terminate();ready.set(compact,data.surfaces);resolve(data.surfaces);};
        worker.onerror=event=>{worker.terminate();pending.delete(compact);reject(new Error(event.message));};
        worker.postMessage({compact});
    });
    pending.set(compact,promise);return promise;
}

export default function useFantasyGeometry(compact){
    const [geometry,setGeometry]=useState(()=>ready.has(compact)?reconstruct(ready.get(compact)):{});
    const loadedQuality=useRef(ready.has(compact)?compact:null);
    useEffect(()=>{
        if(loadedQuality.current===compact)return;
        let canceled=false;
        request(compact).then(surfaces=>{if(!canceled){loadedQuality.current=compact;setGeometry(reconstruct(surfaces));}}).catch(()=>{
            // Preserve the scene if a host disallows workers; run after the first
            // island render rather than making the GLB wait for the background.
            if(!canceled){loadedQuality.current=compact;setGeometry(createFantasyWorld(compact));}
        });
        return()=>{canceled=true;};
    },[compact]);
    useEffect(()=>()=>Object.values(geometry).forEach(g=>g.dispose()),[geometry]);
    return geometry;
}
