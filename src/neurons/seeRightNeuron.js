const seeRightNeuron = function (agent) {
    for(let i = 1; i <= 256; i++){
        for(let area in this.world.breedingAreas){
            if(
                area[0][0] - (agent.posVector[0] + i) < area[0][0] - agent.posVector[0]
                && agent.posVector[1] > area[0][1]
                && agent.posVector[1] < area[1][1]
            ){
                return 1;
            }
        }
    }
    return 0;
}