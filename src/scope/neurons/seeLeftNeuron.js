const seeLeftNeuron = function (agent) {
    for(let idx in this.ctx.breedingAreas) {
        const area = this.ctx.breedingAreas[idx];
        if (agent.actionValue[0] - this.sightRange <= area[1][0]
            && agent.actionValue[1] > area[0][1]
            && agent.actionValue[1] < area[1][1]) {
            return this.sightRange - (agent.actionValue[0] - area[1][0]);
        }
    }
    return 0;
}