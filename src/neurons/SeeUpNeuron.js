class SeeUpNeuron {
    world = null
    type = 0
    constructor(world){
        this.world = world;
    }

    main(agent, input, weight) {
        return this.world.isOccupied(agent.posVector.subtract(new Vector([0, 1]))) ? 0 : 1
    }
}