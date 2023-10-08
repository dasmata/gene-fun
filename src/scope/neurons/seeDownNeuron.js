const seeDownNeuron = function (agent) {
    const distances = [];
    for(let idx in this.ctx.breedingAreas) {
        const area = this.ctx.breedingAreas[idx];
        const sightLine = agent.actionValue[1] + this.sightRange
        if (sightLine >= area[0][1]
            && agent.actionValue[0] > area[0][0]
            && agent.actionValue[0] < area[1][0]) {
            const distance =  area[0][1] - agent.actionValue[1];
            if(distance > 0){
                distances.push(distance);
            }
        }
    }
    const minDistance = distances.length ? Math.min(...distances) : 0;
    let wallDistance = 256 - agent.actionValue[1]; // edge of map
    if (this.ctx.walls.length) {
        for(let i = 0; i < this.ctx.walls.length; i++){
            if(
                this.ctx.walls[i][1][1] >= agent.actionValue[1]
                && agent.actionValue[0] >= this.ctx.walls[i][0][0]
                && agent.actionValue[0] <= this.ctx.walls[i][1][0]
            ){
                const dist = this.ctx.walls[i][1][1] - agent.actionValue[1]; // wall
                wallDistance = Math.min(dist, wallDistance);
                break
            }
        }
    }
    if(minDistance > 0 && minDistance < wallDistance){
        return this.sightRange - minDistance;
    } else if (minDistance === 0){
        return this.defaultVal;
    } else {
        return wallDistance;
    }
}