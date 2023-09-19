class MoveRandNeuron {
    world = null
    type = 2

    constructor(world, weightModifier){
        this.world = world;
        this.weightModifier = weightModifier
    }

    main(agent, input, weight) {
        if (input && this.weightModifier(weight)) {
            const generatedNumbers = [
                Math.round(Math.random()) * Agent.size,
                Math.round(Math.random()) * Agent.size,
            ];
            const changeVector = new Vector(
                generatedNumbers,
                Object.values(this.world.size)
            );
            agent.move([changeVector, Math.round(Math.random()) ? 'add' : 'subtract']);
            return 1
        }
        return 0
    }
}