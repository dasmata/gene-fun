SUMMATION_TYPE_AVG = 1;
SUMMATION_TYPE_SIMPLE = 2;

class GenericNeuron {
    type = 2;
    id = null;
    summationType = ''
    process = () => {}

    constructor(type, neuronFunction, summationType, id){
        this.type = type;
        this.summationType = summationType;
        this.id = id || Math.random().toString(36).substring(2,7);
        this.process = neuronFunction.bind(this);
    }

     main(agent, inputs, weights) {
        const input = this.summationType === SUMMATION_TYPE_AVG
            ? this.avgSummation(inputs, weights)
            : this.simpleSummation(inputs, weights)
        return this.process(agent, input);
    }

    simpleSummation(inputs, weights) {
        return inputs.reduce((sum, input, idx) => {
            return sum + (input * (weights[idx] || 1))
        }, 0);
    }

    avgSummation(inputs, weights) {
        let weightSum = 0
        const weightedInputs =  inputs.reduce((acc, el, idx) => {
            weightSum += weights[idx]
            return acc + (el * weights[idx]);
        }, 0);
        return weightSum === 0 ? 0 : weightedInputs / weightSum;
    }
}
( self || {} ).GenericNeuron = GenericNeuron;
