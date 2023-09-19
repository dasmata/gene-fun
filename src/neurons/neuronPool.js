const neuronPool = (world) => {
    const neuronMap = {
        [Symbol.for('sl')]: SeeLeftNeuron,
        [Symbol.for('sr')]: SeeRightNeuron,
        [Symbol.for('su')]: SeeUpNeuron,
        [Symbol.for('sd')]: SeeDownNeuron,
        [Symbol.for('mrand')]: MoveRandNeuron,
        [Symbol.for('ml')]: MoveLeftNeuron,
        [Symbol.for('mr')]: MoveRightNeuron,
        [Symbol.for('mu')]: MoveUpNeuron,
        [Symbol.for('md')]: MoveDownNeuron,

        [Symbol.for('n')]: NegateNeuron,
    }

    return Object.getOwnPropertySymbols(neuronMap).reduce((acc, type) => {
        acc[type] = new neuronMap[type](world, weightModifier)
        return acc
    }, {
        getInputNeurons: () => [
            Symbol.for('sl'),
            Symbol.for('sr'),
            Symbol.for('su'),
            Symbol.for('sd')
        ],

        getProcessingNeurons: () => [
            Symbol.for('n')
        ],

        getOutputNeurons: () => [
            Symbol.for('mr'),
            Symbol.for('ml'),
            Symbol.for('mr'),
            Symbol.for('mrand'),
            Symbol.for('mu'),
            Symbol.for('md'),
        ]
    })
}