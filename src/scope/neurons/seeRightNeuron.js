const seeRightNeuron = function (agent) {
    const distances = [];
    for(let idx in this.ctx.breedingAreas) {
        const area = this.ctx.breedingAreas[idx];
        if (agent.actionValue[0] + this.sightRange >= area[0][0]
            && agent.actionValue[1] > area[0][1]
            && agent.actionValue[1] < area[1][1]) {

            const distance = area[0][0] - agent.actionValue[0];
            if(distance > 0){
                distances.push(distance);
            }
        }
    }
    const minDistance = distances.length ? Math.min(...distances) : 0;
    let wallDistance = 256 - agent.actionValue[0];

    if (this.ctx.walls.length) {
        for(let i = 0; i < this.ctx.walls.length; i++){
            if(
                this.ctx.walls[i][1][0] >= agent.actionValue[0]
                && agent.actionValue[1] >= this.ctx.walls[i][0][1]
                && agent.actionValue[1] <= this.ctx.walls[i][1][1]
            ){
                const dist = this.ctx.walls[i][1][0] - agent.actionValue[0]; // wall
                wallDistance = Math.min(dist, wallDistance);
                break
            }
        }
    }
    if(minDistance > 0 && minDistance < wallDistance){
        return this.sightRange - minDistance;
    } else if (minDistance === 0){
        return 1;
    } else {
        return wallDistance
    }
}