const seeDownNeuron = function (agent) {
    return this.world.isOccupied(agent.posVector.add(new Vector([0, 1]))) ? 0 : 1
}