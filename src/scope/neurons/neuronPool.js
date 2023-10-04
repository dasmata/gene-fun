const neuronPool = (() => {
    const memoParams = [];
    const memoValues = [];
    const neuronMap = [
        {
            'sl': [seeLeftNeuron.toString(), 'VisionNeuron'],
            'sr': [seeRightNeuron.toString(), 'VisionNeuron'],
            'su': [seeUpNeuron.toString(), 'VisionNeuron'],
            'sd': [seeDownNeuron.toString(), 'VisionNeuron'],
        },
        {
            'pn': processingNegateNeuron.toString(),
            'pv': processingVoidNeuron.toString(),
            'pv2': processingVoidNeuron.toString(),
        },
        {
            'mrand': moveActivationFunction.toString(),
            'mr': moveActivationFunction.toString(),
            'ml': moveActivationFunction.toString(),
            'mu': moveActivationFunction.toString(),
            'md': moveActivationFunction.toString(),
        },
    ]
    return (world) => {
        const cacheId = memoParams.indexOf(world);
        if (cacheId !== -1) {
            return memoValues[cacheId];
        }

        const pool = neuronMap.reduce((acc, level, idx) => {
            Object.keys(level).forEach(type => {
                let className = 'ScopeNeuron';
                let neuronFunc = level[type];
                if(Array.isArray(neuronFunc)){
                    className = neuronFunc[1]
                    neuronFunc = neuronFunc[0];
                }
                acc[type] = [className, neuronFunc, idx, type]
            })
            return acc;
        }, {});

        memoValues.push(pool);
        memoParams.push(world);
        return pool;
    }
})()