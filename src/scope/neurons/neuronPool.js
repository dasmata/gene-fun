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
            'pv1': processingVoidNeuron.toString(),
            'pv2': processingVoidNeuron.toString(),
            'pv3': processingVoidNeuron.toString(),
            'pv4': processingVoidNeuron.toString(),
        },
        {
            'pv5': processingVoidNeuron.toString(),
            'pv6': processingVoidNeuron.toString(),
            'pv7': processingVoidNeuron.toString(),
            'pv8': processingVoidNeuron.toString(),
            // 'pv9': processingVoidNeuron.toString(),
        },
        {
            // 'mrand': moveActivationFunction.toString(),
            'ml': moveActivationFunction.toString(),
            'mr': moveActivationFunction.toString(),
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