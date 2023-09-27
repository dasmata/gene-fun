const seeDownNeuron = function (agent) {
    for(let idx in this.world.breedingAreas) {
        const area = this.world.breedingAreas[idx];
        if (agent.actionValue[1] + this.sightRange >= area[0][1]
            && agent.actionValue[0] > area[0][0]
            && agent.actionValue[0] < area[1][0]) {
            return 1;
        }
    }
    return 0;
}