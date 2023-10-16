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
            'pv1': tanhNeuron.toString(),
            'pv2': tanhNeuron.toString(),
            'pv3': tanhNeuron.toString(),
            'pv4': tanhNeuron.toString(),
        },
        {
            'pv5': tanhNeuron.toString(),
            'pv6': tanhNeuron.toString(),
            'pv7': tanhNeuron.toString(),
            'pv8': tanhNeuron.toString(),
            'pv9': tanhNeuron.toString(),
        },
        {
            // 'mrand': moveActivationFunction.toString(),
            'ml': customSigmoidNeuron.toString(),
            'mr': customSigmoidNeuron.toString(),
            'mu': customSigmoidNeuron.toString(),
            'md': customSigmoidNeuron.toString(),
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