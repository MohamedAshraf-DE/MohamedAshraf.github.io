// Angles and velocity use radians/seconds; motion is independent of event/FPS rate.
export function advanceIslandMotion(state, angle, delta) {
    const dt=Math.min(delta,0.05);
    if(state.target===null) state.target=angle;
    if(!state.dragging){
        const desired=state.key*0.85,rate=state.key?9:5.5;
        const decay=Math.exp(-rate*dt),previous=state.velocity;
        state.velocity=desired+(previous-desired)*decay;
        state.target+=desired*dt+(previous-desired)*(1-decay)/rate;
        if(!state.key && Math.abs(state.velocity)<0.002) state.velocity=0;
    }
    const next=state.target+(angle-state.target)*Math.exp(-18*dt);
    return Math.abs(next-state.target)<0.00001?state.target:next;
}
