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
            'pv1': [tanhNeuron.toString(), 'ScopeNeuron', 6],
            'pv2': [tanhNeuron.toString(), 'ScopeNeuron', 6],
            'pv3': [tanhNeuron.toString(), 'ScopeNeuron', 6],
            'pv4': [tanhNeuron.toString(), 'ScopeNeuron', 6],
        },
        {
            'pv5': [tanhNeuron.toString(), 'ScopeNeuron', 3],
            'pv6': [tanhNeuron.toString(), 'ScopeNeuron', 3],
            'pv7': [tanhNeuron.toString(), 'ScopeNeuron', 3],
            'pv8': [tanhNeuron.toString(), 'ScopeNeuron', 3],
            'pv9': [tanhNeuron.toString(), 'ScopeNeuron', 3],
        },
        {
            // 'mrand': moveActivationFunction.toString(), 'ScopeNeuron', 1],
            'ml': [customSigmoidNeuron.toString(), 'ScopeNeuron', 1],
            'mr': [customSigmoidNeuron.toString(), 'ScopeNeuron', 1],
            'mu': [customSigmoidNeuron.toString(), 'ScopeNeuron', 1],
            'md': [customSigmoidNeuron.toString(), 'ScopeNeuron', 1],
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