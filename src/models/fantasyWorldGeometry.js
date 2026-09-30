import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { randomGenerator } from './nature.js';

function hash(x,z){return (Math.sin(x*127.1+z*311.7)*43758.5453)%1+1;}
function noise(x,z){
    const ix=Math.floor(x),iz=Math.floor(z),u=x-ix,v=z-iz;
    const a=u*u*(3-2*u),b=v*v*(3-2*v),h=(i,j)=>hash(i,j)%1;
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(h(ix,iz),h(ix+1,iz),a),THREE.MathUtils.lerp(h(ix,iz+1),h(ix+1,iz+1),a),b);
}
function fractal(x,z){let n=0,a=.55;for(let i=0;i<5;i++){n+=noise(x,z)*a;x=x*2.03+17;z=z*2.03+9;a*=.48;}return n;}
export function terrainHeight(x,z){
    let y=-226+fractal(x*.008,z*.008)*64;
    const distance=(cx,cz,rx,rz)=>Math.hypot((x-cx)/rx,(z-cz)/rz);
    const main=1-THREE.MathUtils.smoothstep(distance(-285,-476,205,160),.48,1.25);
    const east=1-THREE.MathUtils.smoothstep(distance(260,-546,135,118),.42,1.25);
    y=THREE.MathUtils.lerp(y,-24,main);y=THREE.MathUtils.lerp(y,-99,east);
    const lake=distance(30,-585,210,365);
    y=THREE.MathUtils.lerp(y,-205,1-THREE.MathUtils.smoothstep(lake,.86,1.14));
    return y;
}

// Original stepped academy complex, authored geometry at independent depths.
export function createFantasyWorld(compact=false){
    const rng=randomGenerator(9803),parts=new Map();let mainAcademy=true;
    const academyMatrix=new THREE.Matrix4().compose(new THREE.Vector3(-285,-23,-477),new THREE.Quaternion(),new THREE.Vector3(1.28,1.35,1.15))
        .multiply(new THREE.Matrix4().makeTranslation(249,67,477));
    const add=(type,geometry,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0],color='#ffffff')=>{
        const matrix=new THREE.Matrix4().compose(new THREE.Vector3(...position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale));
        const g=geometry.index?geometry.toNonIndexed():geometry.clone();geometry.dispose();g.applyMatrix4(matrix);if(mainAcademy)g.applyMatrix4(academyMatrix);if(type!=='forest')g.deleteAttribute('uv');
        if(!g.attributes.color){const c=new THREE.Color(color),colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(colors,3));}
        if(!parts.has(type))parts.set(type,[]);parts.get(type).push(g);
    };
    const box=(type,p,size,color,angle=0)=>add(type,new THREE.BoxGeometry(1,1,1),p,size,[0,angle,0],color);
    const drum=(type,p,r,h,color,top=r)=>add(type,new THREE.CylinderGeometry(top,r,h,compact?16:28),p,[1,1,1],[0,0,0],color);
    const arch=new THREE.Shape();arch.moveTo(-.5,0);arch.lineTo(.5,0);arch.lineTo(.5,.62);arch.quadraticCurveTo(.46,.80,0,1);arch.quadraticCurveTo(-.46,.80,-.5,.62);arch.closePath();
    const window=(x,y,z,w,h,angle=0)=>{
        add('trim',new THREE.ShapeGeometry(arch,5),[x,y-.35,z],[w+1.1,h+.65,1],[0,angle,0],'#2c3434');
        const n=new THREE.Vector3(Math.sin(angle),0,Math.cos(angle));
        add('windows',new THREE.ShapeGeometry(arch,5),[x+n.x*.14,y,z+n.z*.14],[w,h,1],[0,angle,0],rng()>.1?'#d3ad6d':'#604d36');
        box('trim',[x+n.x*.19,y+h*.43,z+n.z*.19],[.22,h*.8,.18],'#626b64',angle);
        box('trim',[x,y-.55,z],[w+1.3,.42,.65],'#8b9388',angle);
    };
    const roof=(x,y,z,w,h,d)=>{
        const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,h);shape.closePath();
        add('roof',new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),[x,y,z-d/2],[1,1,1],[0,0,0],'#32464b');
        box('trim',[x,y+h,z],[.9,.9,d+1.5],'#66726c');
    };
    const hall=(x,y,z,w,h,d)=>{
        box('stone',[x,y+h/2,z],[w,h,d],'#757a72');
        box('trim',[x,y+1.5,z],[w+3,3,d+3],'#555f58');
        box('trim',[x,y+h-1,z],[w+2,1.2,d+2],'#a0a597');
        roof(x,y+h,z,w+4,Math.min(25,w*.30),d+4);
        for(let i=0;i<Math.floor(w/8);i++){
            const px=x-w/2+5+i*8;
            box('stone',[px,y+h*.44,z+d/2+1.6],[1.8,h*.94,3.1],'#56625b');
            for(let j=0;j<Math.max(2,Math.floor(h/15));j++)window(px+3,y+5+j*14,z+d/2+.12,2.8,9);
        }
        if(!compact)for(let i=0;i<Math.floor(w/15);i++){
            const px=x-w/2+8+i*15;
            box('stone',[px,y+h+4,z+d*.34],[5,7,5],'#7d8479');
            roof(px,y+h+7.5,z+d*.34,6,5,6);
            window(px,y+h+3,z+d*.34+2.6,1.8,3);
        }
    };
    const tower=(x,y,z,r,h,roofHeight)=>{
        drum('stone',[x,y+h/2,z],r,h,'#747e75',r*.92);
        drum('trim',[x,y+3,z],r+1.8,3.5,'#4b5b51');
        drum('trim',[x,y+h-2,z],r+1.1,1.5,'#9ca497');
        drum('trim',[x,y+h*.63,z],r+.4,1,'#8b978b');
        const rows=compact?3:5,around=compact?7:10;
        for(let row=0;row<rows;row++)for(let i=0;i<around;i++){
            const a=i*Math.PI*2/around;window(x+Math.sin(a)*r*1.012,y+9+row*(h-20)/rows,z+Math.cos(a)*r*1.012,Math.max(1.5,r*.18),6.5,a);
        }
        add('roof',new THREE.ConeGeometry(r*1.25,roofHeight,compact?18:32),[x,y+h+roofHeight/2,z],[1,1,1],[0,0,0],'#34494c');
        drum('trim',[x,y+h+roofHeight+1.8,z],.34,4,'#b9a474',.1);
        if(!compact)for(let i=0;i<6;i++){const a=i*Math.PI/3;box('stone',[x+Math.sin(a)*(r+.2),y+h*.26,z+Math.cos(a)*(r+.2)],[1.3,h*.5,1.3],'#5b6b61',a);}
    };
    // A fortress with an irregular courtyard and a tall observatory; no franchise layout.
    hall(-249,-67,-467,96,43,32);hall(-291,-67,-501,44,60,38);hall(-187,-67,-493,38,47,30);
    hall(-248,-67,-530,92,28,26);
    tower(-292,-67,-520,12,123,47);tower(-199,-67,-517,10,90,39);
    tower(-324,-67,-463,9,72,35);tower(-175,-67,-457,8,69,31);
    tower(-235,-67,-546,7,100,32);tower(-276,-67,-440,6,54,25);
    tower(-221,-67,-439,6,61,28);
    // Buttressed central gate, projecting balcony and rose window.
    hall(-243,-67,-440,26,40,18);
    add('trim',new THREE.RingGeometry(3.4,4.5,24),[-243,-37,-430.65],[1,1,1],[0,0,0],'#a0a99c');
    add('windows',new THREE.CircleGeometry(3.45,24),[-243,-37,-430.30],[1,1,1],[0,0,0],'#c09d68');
    for(let i=0;i<4;i++)add('trim',new THREE.BoxGeometry(.28,7,.23),[-243,-37,-430.05],[1,1,1],[0,0,i*Math.PI/4],'#59675f');
    box('stone',[-249,-69,-477],[151,4,123],'#58695a');
    for(let i=0;i<9;i++){
        const x=-323+i*18;
        box('stone',[x,-64,-416],[15,10,5],'#5c6d5f');
        for(let n=0;n<4;n++)box('trim',[x-6+n*4,-57.8,-416],[2.2,2.6,5],'#82907c');
    }
    mainAcademy=false;
    // A smaller mountain settlement gives depth without mirroring the main academy.
    hall(254,-98,-545,74,28,31);hall(293,-98,-570,31,37,25);
    tower(235,-98,-570,9,80,32);tower(303,-98,-531,7,56,29);
    tower(269,-98,-591,6,62,26);
    for(let i=0;i<(compact?68:148);i++){
        const east=i%4===0,cx=east?264:-285,cz=east?-546:-476;
        const a=rng()*Math.PI*2,r=(east?115:152)+rng()*62,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r*.74;
        if(Math.hypot((x-30)/220,(z+585)/375)<1.05)continue;
        const y=terrainHeight(x,z),w=4+rng()*6,d=5+rng()*6,h=5+rng()*8;
        const footings=[terrainHeight(x-w/2,z-d/2),terrainHeight(x+w/2,z-d/2),terrainHeight(x-w/2,z+d/2),terrainHeight(x+w/2,z+d/2)];
        if(Math.max(...footings)-Math.min(...footings)>5)continue;
        const foundation=Math.min(...footings)-1;
        box('trim',[x,(foundation+y)/2,z],[w+.4,y-foundation+.6,d+.4],'#566056');
        box('stone',[x,y+h/2,z],[w,h,d],new THREE.Color().setHSL(.12,.1,.27+rng()*.08));
        roof(x,y+h,z,w+1,3+rng()*4,d+1);
        window(x,y+2,z+d/2+.1,1.3,2.6);
    }
    // Smooth eroded land with a flattened academy plateau and a winding lake basin.
    const terrain=new THREE.PlaneGeometry(1750,1150,compact?80:160,compact?56:112);terrain.rotateX(-Math.PI/2);
    const position=terrain.attributes.position;
    for(let i=0;i<position.count;i++){const x=position.getX(i),z=position.getZ(i)-652;position.setY(i,terrainHeight(x,z));}
    terrain.computeVertexNormals();
    const color=[],green=new THREE.Color('#49634f'),rock=new THREE.Color('#59645f'),road=new THREE.Color('#81765d'),normal=terrain.attributes.normal;
    for(let i=0;i<position.count;i++){
        const x=position.getX(i),z=position.getZ(i)-652,n=fractal(x*.06,z*.06);
        const c=green.clone().lerp(rock,THREE.MathUtils.smoothstep(1-normal.getY(i),.10,.52)).multiplyScalar(.76+n*.48);
        const trail=Math.abs(x-(-240+Math.sin((z+480)*.012)*32+(z+480)*.18));
        if(trail<2.8&&z>-635&&z<-300)c.lerp(road,.75);
        color.push(c.r,c.g,c.b);
    }
    terrain.setAttribute('color',new THREE.Float32BufferAttribute(color,3));add('terrain',terrain,[0,0,-652]);
    // Distant tree crowns, trunks and varied heights are merged into one surface.
    for(let i=0;i<(compact?500:1600);i++){
        const x=(rng()-.5)*1250,z=-340-rng()*650;
        if(Math.hypot((x-30)/220,(z+585)/375)<1.12)continue;
        if(Math.hypot((x+285)/195,(z+476)/150)<.85)continue;
        const y=terrainHeight(x,z),h=10+rng()*20,r=3+rng()*5;
        add('bark',new THREE.CylinderGeometry(.35,.6,h*.56,6,1,true),[x,y+h*.28,z],[1,1,1],[0,0,0],'#353c2c');
        const yaw=rng()*6.28,c=new THREE.Color().setHSL(.26+rng()*.06,.08,.56+rng()*.15);
        for(let n=0;n<2;n++)for(let face=0;face<3;face++)add('forest',new THREE.PlaneGeometry(1,1),
            [x,y+h*(.53+n*.22),z],[r*(2.6-n*.55),h*(.65-n*.12),1],[0,yaw+face*Math.PI/3,0],c);
    }
    const ridge=(type,centerZ,width,depth,base,height,seed,segments)=>{
        const random=randomGenerator(seed),peaks=Array.from({length:11},(_,i)=>({x:-width*.5+i*width/10,h:height*(.54+random()*.46),w:70+random()*140}));
        const g=new THREE.PlaneGeometry(width,depth,segments,compact?18:36);g.rotateX(-Math.PI/2);const p=g.attributes.position;
        for(let i=0;i<p.count;i++){
            const x=p.getX(i),z=p.getZ(i),t=z/depth+.5;let h=0;
            for(const peak of peaks){const candidate=peak.h*Math.exp(-Math.pow(Math.abs(x-peak.x)/peak.w,1.72));h=Math.pow(Math.pow(h,6)+Math.pow(candidate,6),1/6);}
            const crinkle=fractal(x*.036,(z+centerZ)*.036);
            const erosion=fractal(x*.011,(z+centerZ)*.015),folds=Math.sin(x*.018+z*.025+crinkle*6.0)*13;
            const ravines=Math.pow(Math.abs(Math.sin(x*.052+z*.015+crinkle*3.0)),4)*22;
            p.setY(i,base+h*Math.sin(Math.PI*t)*(.66+erosion*.48)+folds*Math.sin(Math.PI*t)-ravines-Math.pow(t,10)*380);
        }
        g.computeVertexNormals();add(type,g,[0,0,centerZ],[1,1,1],[0,0,0],type==='farMountains'?'#718996':'#4e6966');
    };
    ridge('farMountains',-1180,2100,440,-188,395,111,compact?80:160);
    ridge('nearMountains',-898,1850,370,-177,281,913,compact?72:144);
    // An irregular lake reflects the sky and gives the lower world a readable scale.
    const lake=new THREE.Shape(),points=84;
    for(let i=0;i<=points;i++){const a=i/points*Math.PI*2,r=1+.035*Math.sin(a*7)+.025*Math.cos(a*11),x=30+Math.cos(a)*201*r,z=-585+Math.sin(a)*350*r;if(!i)lake.moveTo(x,-z);else lake.lineTo(x,-z);}
    const water=new THREE.ShapeGeometry(lake,20);water.rotateX(-Math.PI/2);add('water',water,[0,-200,0]);
    const result={};parts.forEach((geometries,type)=>{result[type]=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());result[type].computeBoundingSphere();});return result;
}
