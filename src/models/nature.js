import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Seeded detail placement keeps the island identical across remounts and devices.
export function randomGenerator(seed = 71) {
    return () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}

const noise = `
float natureHash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float natureNoise(vec3 p) {
    vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(natureHash(i),natureHash(i+vec3(1,0,0)),f.x),
    mix(natureHash(i+vec3(0,1,0)),natureHash(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(natureHash(i+vec3(0,0,1)),natureHash(i+vec3(1,0,1)),f.x),
    mix(natureHash(i+vec3(0,1,1)),natureHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
`;

let scannedSurfaces;
function surfaceTextures() {
    if (scannedSurfaces) return scannedSurfaces;
    const loader = new THREE.TextureLoader();
    const ready = { value: 0 };
    let loaded = 0;
    const paths = {
        rockScan: 'aerial_rocks_02-Diffuse.webp',
        meadowScan: 'rocky_terrain_03-Diffuse.webp',
        slateScan: 'roof_slates_02-Diffuse.webp',
        wallScan: 'fort-wall-diff.webp',
    };
    scannedSurfaces = { scanReady: ready };
    Object.entries(paths).forEach(([name, path]) => {
        const texture = loader.load(`/scene-assets/materials/${path}`, () => {
            loaded++;
            if (loaded === Object.keys(paths).length) ready.value = 1;
        });
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        scannedSurfaces[name] = { value: texture };
    });
    return scannedSurfaces;
}

export function naturalMaterial(source, canopies = []) {
    const material = source.clone();
    material.emissiveIntensity = 0.035;
    material.metalness = 0;
    material.roughness = 0.92;
    material.metalnessMap = null;
    material.roughnessMap = null;
    material.userData.cabinNight = { value: 0 };
    material.userData.natureTime = { value: 0 };
    // Soft canopy occlusion is baked into the ground shader, avoiding an SSAO pass.
    const treeShades = [...canopies].sort((a,b)=>b.size.lengthSq()-a.size.lengthSq()).slice(0,12)
        .map(({center,size})=>new THREE.Vector4(center.x,center.z,Math.max(0.8,size.x*0.55),Math.max(0.8,size.z*0.55)));
    while(treeShades.length<12) treeShades.push(new THREE.Vector4(10000,10000,1,1));
    material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, surfaceTextures());
        shader.uniforms.cabinNight = material.userData.cabinNight;
        shader.uniforms.natureTime = material.userData.natureTime;
        shader.uniforms.treeShades = {value:treeShades};
        shader.vertexShader = 'varying vec3 naturePosition; varying vec3 natureNormal;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
            '#include <begin_vertex>\n naturePosition = position; natureNormal = normal;');
        shader.fragmentShader = `uniform sampler2D rockScan;uniform sampler2D meadowScan;uniform sampler2D slateScan;uniform sampler2D wallScan;uniform float scanReady;
            uniform float cabinNight; uniform float natureTime; uniform vec4 treeShades[12]; varying vec3 naturePosition; varying vec3 natureNormal;\n` + noise + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
            #include <map_fragment>
            // Restrict the warm palette glow to upright panes above the doorway.
            float warmWindow = step(0.90,diffuseColor.r) * step(0.68,diffuseColor.g)
                * (1.0-step(0.89,diffuseColor.g)) * step(0.40,diffuseColor.b)
                * (1.0-step(0.60,diffuseColor.b)) * step(4.0,naturePosition.y)
                * (1.0-step(14.0,naturePosition.y)) * (1.0-step(0.45,abs(natureNormal.y)));
            float grain = natureNoise(naturePosition * 22.0);
            float broad = natureNoise(naturePosition * 0.65);
            float detail = natureNoise(naturePosition * 5.0);
            float roofMask=step(diffuseColor.g*1.48,diffuseColor.r)*step(.12,diffuseColor.r)*step(1.5,naturePosition.y);
            vec2 shingleUV=vec2(abs(natureNormal.z)>abs(natureNormal.x)?naturePosition.x:naturePosition.z,naturePosition.y)*vec2(3.4,7.6);
            shingleUV.x+=mod(floor(shingleUV.y),2.0)*.5;
            vec2 shingle=fract(shingleUV);
            float roofSeam=1.0-smoothstep(.02,.10,min(min(shingle.x,1.0-shingle.x),shingle.y));
            diffuseColor.rgb*=1.0-roofMask*(roofSeam*.20+.12*(1.0-natureHash(vec3(floor(shingleUV),0))));
            float plaster=step(.5,diffuseColor.r)*step(.4,diffuseColor.g)*step(.25,diffuseColor.b)*(1.0-warmWindow);
            diffuseColor.rgb*=1.0-plaster*(.04*(1.0-grain)+.05*(1.0-broad));
            float green = step(diffuseColor.r * 0.85, diffuseColor.g) * step(diffuseColor.b * 1.4, diffuseColor.g);
            float ground = max(green * (1.0 - smoothstep(1.8, 3.0, naturePosition.y)),
                step(16.5,length(naturePosition.xz))*step(.75,natureNormal.y)*(1.0-smoothstep(2.5,4.0,naturePosition.y)));
            vec3 meadow = mix(vec3(0.09,0.16,0.045), vec3(0.29,0.36,0.12), broad);
            vec3 stone = mix(vec3(0.19,0.20,0.18),vec3(0.39,0.37,0.30),detail);
            float top = smoothstep(0.35,0.85,natureNormal.y);
            diffuseColor.rgb = mix(diffuseColor.rgb, mix(stone,meadow,top), ground * 0.88);
            float cliff = smoothstep(0.5,2.5,-naturePosition.y);
            float strata = 0.92 + 0.08 * sin(naturePosition.y * 8.0 + broad * 4.0);
            diffuseColor.rgb = mix(diffuseColor.rgb, stone * strata, cliff);
            diffuseColor.rgb *= 0.88 + 0.15 * detail + 0.07 * grain;
            float canopyAO=1.0;
            if(ground>0.5 && top>0.5){
                for(int i=0;i<12;i++){
                    vec2 footprint=(naturePosition.xz-treeShades[i].xy)/treeShades[i].zw;
                    canopyAO*=1.0-0.14*exp(-dot(footprint,footprint)*1.8);
                }
            }
            diffuseColor.rgb*=canopyAO;
            vec3 blendNormal=pow(abs(normalize(natureNormal)),vec3(4.0));
            blendNormal/=max(.001,blendNormal.x+blendNormal.y+blendNormal.z);
            vec3 scannedRock=texture2D(rockScan,naturePosition.zy*.18).rgb*blendNormal.x
                +texture2D(rockScan,naturePosition.xz*.18).rgb*blendNormal.y
                +texture2D(rockScan,naturePosition.xy*.18).rgb*blendNormal.z;
            vec2 wallUV=abs(natureNormal.z)>abs(natureNormal.x)?naturePosition.xy:naturePosition.zy;
            vec3 scannedWall=texture2D(wallScan,wallUV*.14).rgb;
            vec3 scannedRoof=texture2D(slateScan,vec2(wallUV.x,naturePosition.y)*.12).rgb;
            vec3 scannedMeadow=texture2D(meadowScan,naturePosition.xz*.07).rgb;
            vec3 organicTop=mix(scannedRock,scannedMeadow*vec3(.48,.73,.44),top)*canopyAO;
            diffuseColor.rgb=mix(diffuseColor.rgb,scannedWall*.8,plaster*scanReady*.92);
            diffuseColor.rgb=mix(diffuseColor.rgb,organicTop,ground*scanReady*.93);
            diffuseColor.rgb=mix(diffuseColor.rgb,scannedRock*.82,cliff*scanReady);
            diffuseColor.rgb=mix(diffuseColor.rgb,scannedRoof*vec3(.34,.45,.54),roofMask*scanReady);
            float scanHeight=dot(mix(scannedRock,mix(scannedWall,scannedRoof,roofMask),step(1.0,naturePosition.y)),vec3(.299,.587,.114));
        `);
        shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
            #include <emissivemap_fragment>
            float windowFlicker=0.97+0.03*sin(natureTime*1.4+naturePosition.x*0.7);
            totalEmissiveRadiance += vec3(1.0,0.42,0.10) * warmWindow * cabinNight * 1.3 * windowFlicker;
        `);
        shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `
            #include <roughnessmap_fragment>
            float materialGrain=natureNoise(naturePosition*9.0);
            roughnessFactor=clamp(roughnessFactor-0.1+materialGrain*0.16,0.72,1.0);
        `);
        shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `
            #include <normal_fragment_maps>
            float surfaceGrain = natureNoise(naturePosition * 18.0)*.3-roofSeam*roofMask*.3+scanHeight*scanReady*6.0;
            vec3 q0 = dFdx(vViewPosition), q1 = dFdy(vViewPosition);
            vec3 s = cross(q1, normal), t = cross(normal, q0);
            float determinant = dot(q0, s);
            normal = normalize(abs(determinant) * normal - sign(determinant) *
                0.018 * (dFdx(surfaceGrain)*s + dFdy(surfaceGrain)*t));
        `);
    };
    material.customProgramCacheKey = () => 'island-scanned-stone-slate-v6';
    return material;
}

// The loaded GLTF already lives in drei's asset cache. Reuse its processed
// geometry too, including across StrictMode renders and visits to other pages.
const preparedIslands = new WeakMap();

export function prepareIsland(nodes, material) {
    if(preparedIslands.has(nodes)) return preparedIslands.get(nodes);
    const image = material.map.image;
    const canvas = document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, image.width, image.height).data;
    const sample = (uv, i) => {
        const x = Math.min(image.width - 1, Math.max(0, Math.floor(uv.getX(i) * image.width)));
        const y = Math.min(image.height - 1, Math.max(0, Math.floor(uv.getY(i) * image.height)));
        const offset = (y * image.width + x) * 4;
        return [pixels[offset], pixels[offset + 1], pixels[offset + 2]];
    };
    const canopies = [], surfaces = [], grass = [], rocks = [];
    const random = randomGenerator();
    Object.values(nodes).filter(node => node.isMesh).forEach(node => {
        const source = node.geometry;
        const geometry = source.index ? source.toNonIndexed() : source.clone();
        const p = geometry.attributes.position, uv = geometry.attributes.uv;
        const keep = [], leaves = [], cliffPositions = [], cliffUVs = [];
        const midpoint = (a,b) => a.map((value,index)=>(value+b[index])/2);
        const cliffFace = (a,b,c,depth) => {
            if (depth) {
                const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);
                cliffFace(a,ab,ca,depth-1); cliffFace(ab,b,bc,depth-1);
                cliffFace(ca,bc,c,depth-1); cliffFace(ab,bc,ca,depth-1);
                return;
            }
            [a,b,c].forEach(([x,y,z,u,v])=>{
                const weight=THREE.MathUtils.smoothstep(-y,0.5,4);
                const ridge=Math.sin(x*1.7+Math.sin(z*0.8))*Math.cos(z*1.3+y*0.5);
                const grain=Math.sin(x*5.3+z*3.7+y*2.1)*0.12;
                cliffPositions.push(x+weight*(ridge*0.45+grain),y-weight*(0.4+Math.abs(ridge)*0.7),z+weight*(ridge*0.35-grain));
                cliffUVs.push(u,v);
            });
        };
        for (let i = 0; i < p.count; i += 3) {
            const [r,g,b] = sample(uv, i);
            const height = (p.getY(i) + p.getY(i+1) + p.getY(i+2)) / 3;
            const cx = (p.getX(i) + p.getX(i+1) + p.getX(i+2)) / 3;
            const cz = (p.getZ(i) + p.getZ(i+1) + p.getZ(i+2)) / 3;
            // Clear the former cottage, fence and inner trees. Retain the
            // island/cliffs and the outer grove around the new castle terrace.
            if (height > 1.35 && Math.hypot(cx, cz) < 16.5) continue;
            const leafy = g > r * 1.08 && g > b * 1.18 && height > 3;
            if (leafy) leaves.push(i);
            else if (!(g > r * .87 && g > b * 1.35 && geometry.attributes.normal.getY(i) > .65) &&
                (height > 1.35 || (height > -1 && Math.abs(geometry.attributes.normal.getY(i)) < .65))) continue;
            else if (Math.min(p.getY(i),p.getY(i+1),p.getY(i+2)) < -0.5) {
                const vertices=[i,i+1,i+2].map(j=>[p.getX(j),p.getY(j),p.getZ(j),uv.getX(j),uv.getY(j)]);
                cliffFace(...vertices,2);
            } else keep.push(i, i+1, i+2);
            // Only grow details on upward-facing, grass-coloured ground.
            const a = new THREE.Vector3().fromBufferAttribute(p, i);
            const bV = new THREE.Vector3().fromBufferAttribute(p, i+1);
            const c = new THREE.Vector3().fromBufferAttribute(p, i+2);
            const cross = bV.clone().sub(a).cross(c.clone().sub(a));
            const area = cross.length() / 2;
            if (g > r * 0.87 && g > b * 1.35 && height < 2 && cross.normalize().y > 0.85) {
                for (let n = 0; n < Math.min(70, Math.floor(area * 1.5)); n++) {
                    let u=random(), v=random(); if(u+v>1){u=1-u;v=1-v;}
                    const point=a.clone().lerp(bV,u).add(c.clone().sub(a).multiplyScalar(v));
                    grass.push({ position: point.toArray(), scale: 0.12+random()*0.23, rotation: random()*Math.PI,
                        color:new THREE.Color().setHSL(0.20+random()*0.065,0.27+random()*0.15,0.36+random()*0.18) });
                    if(random()<0.007) rocks.push({position:point.toArray(),scale:0.16+random()*0.5,rotation:random()*6.28});
                }
            }
        }
        // Join the faces of each original canopy, including duplicated UV seams.
        const groups = [], vertexGroups = new Map();
        leaves.forEach(i => {
            const keys = [i,i+1,i+2].map(j => `${p.getX(j).toFixed(3)},${p.getY(j).toFixed(3)},${p.getZ(j).toFixed(3)}`);
            const touching = [...new Set(keys.map(k=>vertexGroups.get(k)).filter(Boolean))];
            const group = touching[0] || { indices: [], keys: new Set() };
            if (!touching.length) groups.push(group);
            touching.slice(1).forEach(other=>{
                group.indices.push(...other.indices);
                other.keys.forEach(k=>{group.keys.add(k);vertexGroups.set(k,group);});
                other.indices=[]; other.keys.clear();
            });
            group.indices.push(i,i+1,i+2);
            keys.forEach(k=>{group.keys.add(k);vertexGroups.set(k,group);});
        });
        groups.filter(g=>g.indices.length).forEach(group=>{
            const box = new THREE.Box3();
            group.indices.forEach(i=>box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,i)));
            const size=box.getSize(new THREE.Vector3());
            if (size.length()>0.5) canopies.push({center:box.getCenter(new THREE.Vector3()),size});
        });
        geometry.setIndex(keep);
        surfaces.push({name:node.name,geometry});
        if(cliffPositions.length) {
            const cliff=new THREE.BufferGeometry();
            cliff.setAttribute('position',new THREE.Float32BufferAttribute(cliffPositions,3));
            cliff.setAttribute('uv',new THREE.Float32BufferAttribute(cliffUVs,2));
            const smooth=mergeVertices(cliff,0.001);
            smooth.computeVertexNormals();
            cliff.dispose();
            surfaces.push({name:`${node.name}-cliffs`,geometry:smooth});
        }
    });
    const details={surfaces,canopies,grass,rocks};
    preparedIslands.set(nodes,details);
    return details;
}
