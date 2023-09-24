const seeUpNeuron = function (agent, input, weight) {
     for(let i = 1; i <= this.sightRange; i++){
        for(let idx in this.world.breedingAreas){
            const area = this.world.breedingAreas [idx];
               if(
                   (agent.posVector[1] - i) - area[0][1] < agent.posVector[1] - area[0][1]
                   && agent.posVector[0] > area[0][0]
                   && agent.posVector[0] < area[1][0]
               ){
                    return 1;
               }
          }
     }
     return 0;
}