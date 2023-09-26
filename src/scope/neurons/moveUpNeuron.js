const moveUpNeuron = function (agent, input, weight){
    if (input) {
        const changeVector = new Vector(
            [0, 2],
            Object.values(this.world.size)
        );
        agent.requestAction([changeVector, 'subtract']);
        return 1
    }
    return 0
}
