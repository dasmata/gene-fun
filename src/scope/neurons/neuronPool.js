const neuronPool = (() => {
    const memoParams = [];
    const memoValues = [];
    const neuronMap = [
        {
            'sl': [seeLeftNeuron.toString(), 'VisionNeuron', 2],
            'sr': [seeRightNeuron.toString(), 'VisionNeuron', 2],
            'su': [seeUpNeuron.toString(), 'VisionNeuron', 2],
            'sd': [seeDownNeuron.toString(), 'VisionNeuron', 2],
        },
        {
            'pv1': [processingVoidNeuron.toString(), 'ScopeNeuron', 1],
            'pv2': [processingVoidNeuron.toString(), 'ScopeNeuron', 1],
            'pv3': [processingVoidNeuron.toString(), 'ScopeNeuron', 1],
            'pv4': [processingVoidNeuron.toString(), 'ScopeNeuron', 1],
        },
        {
            'pv5': [processingVoidNeuron.toString(), 'ScopeNeuron', 1],
            'pv6': [processingVoidNeuron.toString(), 'ScopeNeuron', 1],
            'pv7': [processingVoidNeuron.toString(), 'ScopeNeuron', 1],
            'pv8': [processingVoidNeuron.toString(), 'ScopeNeuron', 1],
            'pv9': [processingVoidNeuron.toString(), 'ScopeNeuron', 1],
        },
        {
            // 'mrand': [moveActivationFunction.toString(), 'ScopeNeuron', SUMMATION_TYPE_AVG],
            'ml': [moveActivationFunction.toString(), 'ScopeNeuron', 1],
            'mr': [moveActivationFunction.toString(), 'ScopeNeuron', 1],
            'mu': [moveActivationFunction.toString(), 'ScopeNeuron', 1],
            'md': [moveActivationFunction.toString(), 'ScopeNeuron', 1],
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
                let summationType = 1;
                if(Array.isArray(neuronFunc)){
                    className = neuronFunc[1]
                    summationType = neuronFunc[2]
                    neuronFunc = neuronFunc[0];
                }
                acc[type] = [className, neuronFunc, idx, type, summationType]
            })
            return acc;
        }, {});

        memoValues.push(pool);
        memoParams.push(world);
        return pool;
    }
})()