const neuronPool = (world) => {
    const neuronMap = {
        [Symbol.for('sl')]: seeLeftNeuron,
        [Symbol.for('sr')]: seeRightNeuron,
        [Symbol.for('su')]: seeUpNeuron,
        [Symbol.for('sd')]: seeDownNeuron,

        [Symbol.for('mrand')]: moveRandNeuron,
        [Symbol.for('ml')]: moveLeftNeuron,
        [Symbol.for('mr')]: moveRandNeuron,
        [Symbol.for('mu')]: moveUpNeuron,
        [Symbol.for('md')]: moveDownNeuron,

        [Symbol.for('n')]: negateNeuron,
    }

    return Object.getOwnPropertySymbols(neuronMap).reduce((acc, type) => {
        acc[type] = new GenericNeuron(world, neuronMap[type])
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