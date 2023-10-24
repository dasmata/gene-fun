import { seeUpNeuron } from "./seeUpNeuron.js";
import { seeRightNeuron } from "./seeRightNeuron.js";
import { seeDownNeuron } from "./seeDownNeuron.js";
import { seeLeftNeuron } from "./seeLeftNeuron.js";
import { tanhNeuron } from "./tanhNeuron.js";
import { customSigmoidNeuron } from "./customSigmoidNeuron.js";
import { sigmoidNeuron } from "./sigmoidNeuron.js";
import { nothingNeuron } from "./nothingNeuron.js";

const activationFunction = {
    'seeLeftNeuron': seeLeftNeuron,
    'seeUpNeuron': seeUpNeuron,
    'seeDownNeuron': seeDownNeuron,
    'seeRightNeuron': seeRightNeuron,
    'tanhNeuron': tanhNeuron,
    'customSigmoidNeuron': customSigmoidNeuron,
    'sigmoidNeuron': sigmoidNeuron,
    'nothingNeuron': nothingNeuron
}

const neuronMap = [
    {
        'sl': {
            activation: 'seeLeftNeuron',
            constructor: 'VisionNeuron',
            summation: 2
        },
        'sr': {
            activation: 'seeRightNeuron',
            constructor: 'VisionNeuron',
            summation: 2
        },
        'su': {
            activation: 'seeUpNeuron',
            constructor: 'VisionNeuron',
            summation: 2},
        'sd': {
            activation: 'seeDownNeuron',
            constructor: 'VisionNeuron',
            summation: 2
        }
    },
    {
        'pv1': {
            activation: 'tanhNeuron',
            constructor: 'ScopeNeuron',
            summation: 6
        },
        'pv2': {
            activation: 'tanhNeuron',
            constructor: 'ScopeNeuron',
            summation: 6
        },
        'pv3': {
            activation: 'tanhNeuron',
            constructor: 'ScopeNeuron',
            summation: 6
        },
        'pv4': {
            activation: 'tanhNeuron',
            constructor: 'ScopeNeuron',
            summation: 6
        },
    },
    {
        'pv5': {
            activation: 'tanhNeuron',
            constructor: 'ScopeNeuron',
            summation: 3
        },
        'pv6': {
            activation: 'tanhNeuron',
            constructor: 'ScopeNeuron',
            summation: 3
        },
        'pv7': {
            activation: 'tanhNeuron',
            constructor: 'ScopeNeuron',
            summation: 3
        },
        'pv8': {
            activation: 'tanhNeuron',
            constructor: 'ScopeNeuron',
            summation: 3
        },
        'pv9': {
            activation: 'tanhNeuron',
            constructor: 'ScopeNeuron',
            summation: 3
        },
    },
    {
        'ml': {
            activation: 'customSigmoidNeuron',
            constructor: 'ScopeNeuron',
            summation: 1
        },
        'mr': {
            activation: 'customSigmoidNeuron',
            constructor: 'ScopeNeuron',
            summation: 1
        },
        'mu': {
            activation: 'customSigmoidNeuron',
            constructor: 'ScopeNeuron',
            summation: 1
        },
        'md': {
            activation: 'customSigmoidNeuron',
            constructor: 'ScopeNeuron',
            summation: 1
        },
    },
]

const neuronPool = (() => {
    return (map) => {
        return (map || neuronMap).reduce((acc, level, idx) => {
            Object.keys(level).forEach(type => {
                let neuronData = level[type];
                acc[type] = [
                    neuronData.constructor,
                    activationFunction[neuronData.activation].toString(),
                    idx,
                    type,
                    neuronData.summation
                ]
            })
            return acc;
        }, {});
    }
})()

export { neuronPool, neuronMap }