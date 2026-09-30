import { createFantasyWorld } from './fantasyWorldGeometry.js';

// Build the large background away from the UI thread. The island and creature
// have independent loaders and never wait for this job.
self.onmessage=({data:{compact}})=>{
    const started=performance.now(),geometry=createFantasyWorld(compact),surfaces={},transfer=[];
    Object.entries(geometry).forEach(([name,geo])=>{
        const attributes={};
        Object.entries(geo.attributes).forEach(([key,attribute])=>{
            attributes[key]={array:attribute.array,itemSize:attribute.itemSize,normalized:attribute.normalized};
            transfer.push(attribute.array.buffer);
        });
        surfaces[name]=attributes;geo.dispose();
    });
    self.postMessage({surfaces,elapsedMs:Math.round(performance.now()-started)},transfer);
};
