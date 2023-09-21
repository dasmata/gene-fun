const seeLeftNeuron = function (agent) {
     return this.world.isOccupied(agent.posVector.subtract(new Vector([1, 0]))) ? 0 : 1
}