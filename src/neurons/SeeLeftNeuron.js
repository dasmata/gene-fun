class SeeLeftNeuron {
    world = null
    type = 0
    constructor(world){
        this.world = world;
    }

    main(agent, input, weight) {
         return this.world.isOccupied(agent.posVector.subtract(new Vector([1, 0]))) ? 0 : 1
    }
}