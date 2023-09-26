const moveRandNeuron = function (agent, input) {
    if (input) {
        const generatedNumbers = [
            Math.round(Math.random()) * Map.agentSize,
            Math.round(Math.random()) * Map.agentSize,
        ];
        const changeVector = new Vector(
            generatedNumbers,
            Object.values(this.world.size)
        );
        agent.requestAction([changeVector, Math.round(Math.random()) ? 'add' : 'subtract']);
        return 1
    }
    return 0
}