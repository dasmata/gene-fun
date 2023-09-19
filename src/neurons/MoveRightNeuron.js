class MoveRightNeuron {
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
                0,
            ];
            const changeVector = new Vector(
                generatedNumbers,
                Object.values(this.world.size)
            );

            agent.move([changeVector, 'add']);
            return 1
        }
        return 0
    }
}