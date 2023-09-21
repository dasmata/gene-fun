class Brain {
    levels = []
    connections = {};
    levelIndex = {};
    constructor(neurons) {
        const mappingFunc = lvl => (el, idx) => {
            this.levelIndex[neurons[el].id] = [lvl, idx]
            return neurons[el];
        }
        this.levels = [
            neurons.getInputNeurons().map(mappingFunc(0)),
            neurons.getProcessingNeurons().map(mappingFunc(1)),
            neurons.getOutputNeurons().map(mappingFunc(2))
        ]
    }

    addConnection(neuron1, neuron2, weight) {
        this.connections[neuron1] = this.connections[neuron1] || [];
        this.connections[neuron1].push([neuron2, weight]);
    }

    weightFunction(inputs, weights) {
        return Math.abs(inputs.reduce((acc, el) => acc + el, 0) / weights.reduce((acc, el) => acc + el, 0))
    }

    compute(agent) {
        return this.levels.reduce((lvlResults, lvl, i) => {
            if (lvlResults) {
                Object.keys(lvlResults).forEach((source) => {
                    this.connections[source]?.forEach(connection => {
                        const [level, idx] = this.levelIndex[connection[0]] || [-1, -1];
                        if (level === i){
                            const resArr = lvlResults[lvl[idx].id] || []
                            resArr.push({val: lvl[idx].main(agent, lvlResults[source]), weight: connection[1]});
                            lvlResults[lvl[idx].id] = resArr;
                        }
                    })
                });
                Object.keys(lvlResults).forEach(key => {
                    if(lvlResults[key].length < 2){
                        return true;
                    }
                    lvlResults[key] = [ { val: Math.round(this.weightFunction(...lvlResults[key].reduce((sums, el) => {
                        sums[0].push(el.val);
                        sums[1].push(el.weight || 1);
                        return sums;
                    }, [[], []]))), weight: null }];
                })
                return lvlResults;
            }
            return lvl.reduce((acc, neuron) => {
                acc[neuron.id] = [{val: neuron.main(agent), weight: null}];
                return acc;
            }, {})
        }, null);
    }
}