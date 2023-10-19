const SUMMATION_TYPE_AVG = 1;
const SUMMATION_TYPE_TOTAL = 2;
const SUMMATION_TYPE_MULTIPLICATION = 3;
const SUMMATION_TYPE_MAX = 4;
const SUMMATION_TYPE_MIN = 5;
const SUMMATION_TYPE_INCREMENTAL_TOTAL = 6;

const incrementalGenerator = function* (summationFunction){
    let prev = 0, inputs, weights;
    while (true) {
        const {inputs, weights} = yield;
        prev += summationFunction(inputs, weights);
        yield prev;
    }
}

class GenericNeuron {
    type = 2;
    id = null;
    summationType = ''
    process = () => {}
    generators = {};
    functionMap = new Map();

    constructor(type, neuronFunction, summationType, id){
        this.type = type;
        this.summationType = summationType;
        this.id = id || Math.random().toString(36).substring(2,7);
        this.process = neuronFunction.bind(this);
        this.functionMap.set(SUMMATION_TYPE_AVG, this.avgSummation.bind(this));
        this.functionMap.set(SUMMATION_TYPE_INCREMENTAL_TOTAL, this.incrementalTotalSummation.bind(this));
        this.functionMap.set(SUMMATION_TYPE_MULTIPLICATION, this.multiplicationSummation.bind(this));
        this.functionMap.set(SUMMATION_TYPE_TOTAL, this.totalSummation.bind(this));
        this.functionMap.set(SUMMATION_TYPE_MIN, this.minSummation.bind(this));
        this.functionMap.set(SUMMATION_TYPE_MAX, this.maxSummation.bind(this));
    }

     main(agent, inputs, weights) {
        const input = this.functionMap.has(this.summationType)
            ? this.functionMap.get(this.summationType)(inputs, weights)
            : this.avgSummation(inputs, weights)
        return this.process(agent, input);
    }

    totalSummation(inputs, weights) {
        return inputs.reduce((sum, input, idx) => {
            return sum + (input * (weights[idx] || 1))
        }, 0);
    }

    multiplicationSummation(inputs, weights) {
        return inputs.reduce((sum, input, idx) => {
            return sum * (input * (weights[idx] || 1))
        }, 1);
    }

    maxSummation(inputs, weights) {
        return Math.max(...inputs.map((el, idx) => {
            return el * (weights[idx] || 1)
        }));
    }
    minSummation(inputs, weights) {
        return Math.min(...inputs.map((el, idx) => {
            return el * (weights[idx] || 1)
        }));
    }

    incrementalTotalSummation(inputs, weights){
        this.generator = this.generator || incrementalGenerator(this.totalSummation);
        this.generator.next();
        return this.generator.next({ inputs, weights }).value;
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

export {
    SUMMATION_TYPE_AVG,
    SUMMATION_TYPE_MIN,
    SUMMATION_TYPE_TOTAL,
    SUMMATION_TYPE_MULTIPLICATION,
    SUMMATION_TYPE_INCREMENTAL_TOTAL,
    SUMMATION_TYPE_MAX,
    GenericNeuron
}
