const moveRandNeuron = function (agent, input) {
    if (input) {
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