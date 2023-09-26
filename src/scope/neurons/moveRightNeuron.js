const moveRightNeuron = function (agent, input, weight) {
    if (input) {
        const changeVector = new Vector(
            [2, 0],
            Object.values(this.world.size)
        );

        agent.requestAction([changeVector, 'add']);
        return 1
    }
    return 0
}