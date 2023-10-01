const seeRightNeuron = function (agent) {
    for(let idx in this.ctx.breedingAreas) {
        const area = this.ctx.breedingAreas[idx];
        if (agent.actionValue[0] + this.sightRange >= area[0][0]
            && agent.actionValue[1] > area[0][1]
            && agent.actionValue[1] < area[1][1]) {
            return 1;
        }
    }
    return 0;
}