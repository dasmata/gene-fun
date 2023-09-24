const neuronPool = (() => {
    const memoParams = [];
    const memoValues = [];
    const neuronMap = {
        [Symbol.for('sl')]: [seeLeftNeuron, VisionNeuron],
        [Symbol.for('sr')]: [seeRightNeuron, VisionNeuron],
        [Symbol.for('su')]: [seeUpNeuron, VisionNeuron],
        [Symbol.for('sd')]: [seeDownNeuron, VisionNeuron],
        // [Symbol.for('srand')]: senseRandomNeuron,

        [Symbol.for('mrand')]: moveRandNeuron,
        [Symbol.for('ml')]: moveLeftNeuron,
        [Symbol.for('mr')]: moveRightNeuron,
        [Symbol.for('mu')]: moveUpNeuron,
        [Symbol.for('md')]: moveDownNeuron,

        [Symbol.for('pn')]: processingNegateNeuron,
        [Symbol.for('pv')]: processingVoidNeuron,
        [Symbol.for('pv2')]: processingVoidNeuron,
    }
    return (world) => {
        const cacheId = memoParams.indexOf(world);
        if (cacheId !== -1) {
            return memoValues[cacheId];
        }

        const pool = Object.getOwnPropertySymbols(neuronMap).reduce((acc, type) => {
            let className = GenericNeuron;
            let neuronFunc = neuronMap[type];
            if(Array.isArray(neuronFunc)){
                className = neuronFunc[1]
                neuronFunc = neuronFunc[0];
            }
            acc[type] = new className(world, type, neuronFunc)
            console.log(type, acc[type].id)
            return acc
        }, {
            getInputNeurons: () => [
                Symbol.for('sl'),
                Symbol.for('sr'),
                Symbol.for('su'),
                Symbol.for('sd'),
                // Symbol.for('srand'),
            ],

            getProcessingNeurons: () => [
                Symbol.for('pn'),
                Symbol.for('pv'),
                Symbol.for('pv2'),
            ],

            getOutputNeurons: () => [
                Symbol.for('ml'),
                Symbol.for('mr'),
                Symbol.for('mrand'),
                Symbol.for('mu'),
                Symbol.for('md'),
            ]
        });
        memoValues.push(pool);
        memoParams.push(world);
        return pool;
    }
})()