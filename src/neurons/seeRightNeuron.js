const seeRightNeuron = function (agent) {
    return this.world.isOccupied(agent.posVector.add(new Vector([1, 0]))) ? 0 : 1
}