import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// A newly authored vintage monoplane; its GLB predecessor remains in assets.
export function createAircraftGeometry() {
    const buckets={paint:[],metal:[],rubber:[]};
    const add=(type,geo,p=[0,0,0],s=[1,1,1],rotation=[0,0,0],color='#ffffff')=>{
        const g=geo.index?geo.toNonIndexed():geo.clone();geo.dispose();
        g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...s)));
        g.deleteAttribute('uv');const tint=new THREE.Color(color),colors=new Float32Array(g.attributes.position.count*3);
        for(let i=0;i<colors.length;i+=3){colors[i]=tint.r;colors[i+1]=tint.g;colors[i+2]=tint.b;}
        g.setAttribute('color',new THREE.BufferAttribute(colors,3));buckets[type].push(g);
    };
    const profile=[[0.05,-4.7],[0.22,-4.0],[0.4,-3.0],[0.6,-1.8],[0.79,-0.5],[0.85,0.8],[0.79,2.1],[0.65,3.4],[0.38,4.0],[0,4.25]];
    const fuselage=new THREE.LatheGeometry(profile.map(([r,z])=>new THREE.Vector2(r,z)),32);
    fuselage.rotateX(Math.PI/2);add('paint',fuselage,[0,0,0],[1,1,1],[0,0,0],'#66776d');
    const wing=new THREE.Shape();wing.moveTo(0,1.55);wing.lineTo(1.5,1.4);wing.lineTo(6.1,0.3);
    wing.quadraticCurveTo(6.85,0.08,6.8,-0.48);wing.quadraticCurveTo(6.78,-1.0,6.05,-1.12);
    wing.lineTo(1.4,-1.35);wing.lineTo(-1.4,-1.35);wing.lineTo(-6.05,-1.12);
    wing.quadraticCurveTo(-6.78,-1.0,-6.8,-0.48);wing.quadraticCurveTo(-6.85,0.08,-6.1,0.3);
    wing.lineTo(-1.5,1.4);wing.closePath();
    const wingGeo=()=>{const g=new THREE.ExtrudeGeometry(wing,{depth:0.13,bevelEnabled:true,bevelThickness:0.035,bevelSize:0.07,bevelSegments:1,curveSegments:8});g.rotateX(Math.PI/2);return g;};
    add('paint',wingGeo(),[0,-0.1,0],[1,1,1],[0,0,0],'#748379');
    add('paint',wingGeo(),[0,0.18,-3.65],[0.39,0.65,0.42],[0,0,0],'#66776d');
    const fin=new THREE.Shape();fin.moveTo(-0.6,0);fin.lineTo(0.7,0.2);fin.quadraticCurveTo(0.55,1.6,-0.25,1.6);
    fin.lineTo(-0.8,0.2);fin.closePath();
    add('paint',new THREE.ExtrudeGeometry(fin,{depth:0.11,bevelEnabled:true,bevelThickness:0.02,bevelSize:0.02,bevelSegments:1,curveSegments:8}),[-0.055,0.24,-3.3],[1,1,1],[0,Math.PI/2,0],'#5a716d');
    add('metal',new THREE.CylinderGeometry(0.69,0.77,0.82,32),[0,0,3.18],[1,1,1],[Math.PI/2,0,0],'#c3baa0');
    add('metal',new THREE.ConeGeometry(0.42,0.78,24),[0,0,4.0],[1,1,1],[Math.PI/2,0,0],'#c6bdab');
    for(const z of [-0.65,0.58])add('metal',new THREE.TorusGeometry(0.61,0.028,6,24,Math.PI),[0,0.65,z],[1,0.75,1],[0,0,0],'#c1c6bb');
    for(const side of [-1,1]){
        add('metal',new THREE.BoxGeometry(0.028,0.035,1.35),[side*0.59,0.65,-0.02],[1,1,1],[0,0,0],'#b8c2b9');
        for(let i=0;i<5;i++)add('metal',new THREE.CylinderGeometry(0.075,0.075,0.23,8),[side*0.73,-0.25,1.6-i*0.25],[1,1,1],[0,0,Math.PI/2],'#746c60');
        add('paint',new THREE.BoxGeometry(0.45,0.035,2.35),[side*3.7,0.015,-0.35],[1,1,1],[0,0,0],'#d1c8a7');
        add('metal',new THREE.BoxGeometry(4.0,0.012,0.018),[side*3.7,0.012,-0.87],[1,1,1],[0,0.025*side,0],'#394c45');
        add('metal',new THREE.CylinderGeometry(0.05,0.07,0.82,8),[side*1.25,-0.59,0.35],[1,1,1],[0,0,-side*0.18],'#b1b7a9');
        add('rubber',new THREE.CylinderGeometry(0.3,0.3,0.17,20),[side*1.32,-1.01,0.37],[1,1,1],[0,0,Math.PI/2],'#242d2d');
        add('metal',new THREE.CylinderGeometry(0.12,0.12,0.18,16),[side*1.32,-1.01,0.37],[1,1,1],[0,0,Math.PI/2],'#9aab9f');
    }
    add('rubber',new THREE.CylinderGeometry(0.12,0.12,0.12,12),[0,-0.48,-3.8],[1,1,1],[0,0,Math.PI/2],'#242d2d');
    add('metal',new THREE.BoxGeometry(0.02,0.028,1.3),[0,1.13,-0.07],[1,1,1],[0,0,0],'#c1c6bb');
    const result={};Object.entries(buckets).forEach(([type,geometries])=>{
        result[type]=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());result[type].computeBoundingSphere();
    });return result;
}

export function createAircraftPath(narrow = false) {
    const points=[[-23,-2,-18],[0,0,-16],[25,4,-25],[31,9,-46],[17,12,-71],[-13,9,-78],[-31,5,-61],[-36,0,-35]];
    return new THREE.CatmullRomCurve3(points.map(([x,y,z])=>new THREE.Vector3(x*(narrow?0.52:1),y,z)),true,'centripetal',0.5);
}
