const moveLeftNeuron = function (agent, input) {
    if (input) {
        const changeVector = new Vector(
            [2, 0],
            Object.values(this.world.size)
        );

        agent.move([changeVector, 'subtract']);
        return 1
    }
    return 0
}