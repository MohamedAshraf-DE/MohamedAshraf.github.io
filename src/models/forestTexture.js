import { CanvasTexture, SRGBColorSpace } from 'three';
import { randomGenerator } from './nature';

// An original botanical crown mask. Three intersecting cards per crown give
// distant trees volume, fine leaf edges and depth at a fraction of mesh cost.
export function createForestTexture(){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
    const ctx=canvas.getContext('2d'),random=randomGenerator(428),palette=['#3b5737','#48673e','#587648','#66864f','#75945b','#42603d'];
    ctx.strokeStyle='#4f5037';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(253,487);ctx.lineTo(254,286);ctx.stroke();
    for(let i=0;i<28;i++){
        const angle=random()*Math.PI*2,r=60+random()*140,x=256+Math.cos(angle)*r,y=244+Math.sin(angle)*r*.80;
        ctx.lineWidth=1+random()*3;ctx.beginPath();ctx.moveTo(254,350);ctx.quadraticCurveTo(252,y+45,x,y);ctx.stroke();
    }
    // Draw deep foliage first, then smaller edge leaves and sun-facing sprays.
    for(let i=0;i<2100;i++){
        const angle=random()*Math.PI*2,r=Math.sqrt(random()),x=256+Math.cos(angle)*r*225,y=237+Math.sin(angle)*r*207;
        const size=3.5+random()*8;
        ctx.fillStyle=palette[Math.floor(random()*palette.length)];ctx.beginPath();
        ctx.ellipse(x,y,size,size*.48,random()*Math.PI,0,Math.PI*2);ctx.fill();
    }
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.anisotropy=4;return texture;
}
