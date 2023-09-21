const seeUpNeuron = function (agent, input, weight) {
    return this.world.isOccupied(agent.posVector.subtract(new Vector([0, 1]))) ? 0 : 1
}