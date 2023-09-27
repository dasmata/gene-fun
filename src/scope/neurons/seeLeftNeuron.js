const seeLeftNeuron = function (agent) {
    for(let idx in this.world.breedingAreas) {
        const area = this.world.breedingAreas[idx];
        if (agent.actionValue[0] - this.sightRange <= area[1][0]
            && agent.actionValue[1] > area[0][1]
            && agent.actionValue[1] < area[1][1]) {
            return 1;
        }
    }
    return 0;
}