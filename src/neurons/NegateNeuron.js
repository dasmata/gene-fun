class NegateNeuron {
    world = null
    type = 1
    constructor(world, weightModifier){
        this.world = world;
        this.weightModifier = weightModifier
    }

    main(agent, input, weight) {
        if(weight < 0){
            return 0
        }
        if (this.weightModifier(weight)) {
            return input ? 0 : 1;
        }
        return input
    }
}