const moveDownNeuron = function (agent, input) {
    if (input) {
        const changeVector = new Vector(
            [0, 2],
            Object.values(this.world.size)
        );
        agent.move([changeVector, 'add']);
        return 1
    }
    return 0
}