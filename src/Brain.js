class Brain extends Observable {
    levels = []
    connections = {};
    levelIndex = {};
    agent = null;
    rewardFunction;
    constructor(neurons, agent, rewardFunction) {
        super();
        this.agent = agent;
        const mappingFunc = lvl => (el, idx) => {
            this.levelIndex[neurons[el].id] = [lvl, idx]
            return neurons[el];
        }
        this.levels = [
            neurons.getInputNeurons().map(mappingFunc(0)),
            neurons.getProcessingNeurons().map(mappingFunc(1)),
            neurons.getOutputNeurons().map(mappingFunc(2))
        ];
        this.rewardFunction = rewardFunction;
    }

    addConnection(neuron1, neuron2, weight) {
        this.connections[neuron1] = this.connections[neuron1] || [];
        this.connections[neuron1].push([neuron2, weight]);
    }

    weightFunction(inputs, weights) {
        let weightSum = 0
        const weightedInputs =  inputs.reduce((acc, el, idx) => {
            weightSum += weights[idx]
            return el * weights[idx];
        }, 0);
        return weightSum === 0 ? 0 : weightedInputs / weightSum;
    }

    compute() {
        const results = this.levels.reduce((lvlResults, lvl, i) => {
            if (lvlResults) {
                const resultsObj = {}
                Object.keys(lvlResults).forEach((source) => {
                    this.connections[source]?.forEach(connection => {
                        const [level, idx] = this.levelIndex[connection[0]] || [-1, -1];

                        if (level === i && this.connections[lvl[idx].id]) {
                            resultsObj[lvl[idx].id] = resultsObj[lvl[idx].id] || [];
                            resultsObj[lvl[idx].id].push({val: lvl[idx].main(this.agent, lvlResults[source].val), weight: connection[1], prev: [source]});
                        }
                    })
                });
                Object.keys(resultsObj).forEach(key => {
                    if(resultsObj[key].length < 2){
                        lvlResults[key] = resultsObj[key][0];
                        return true;
                    }
                    const sums = resultsObj[key].reduce((sums, el) => {
                        sums[0].push(el.val);
                        sums[1].push(el.weight);
                        sums[2] = sums[2].concat(el.prev)
                        return sums;
                    }, [[], [], []]);
                    const val = Math.round(this.weightFunction(sums[0], sums[1]))
                    lvlResults[key] = { val, weight: resultsObj[key], prev: sums[2] };
                })
                return lvlResults;
            }
            return lvl.reduce((acc, neuron) => {
                if(this.connections[neuron.id]) {
                    acc[neuron.id] = {val: neuron.main(this.agent), weight: null, prev: null};
                }
                return acc;
            }, {})
        }, null);

        this.notify({
            type: 'compute',
            payload: { results, brain: this }
        })

        return results;
    }

    evaluate(result) {
        const reward = this.rewardFunction(this.agent);
        const rewardsToApply = [];
        let found = false;
        this.levels[this.levels.length - 1].forEach(neuron => {
            if (!result[neuron.id]) {
                return true;
            }
            let calculatedReward = null;
            if(result[neuron.id].val){
                found = true;
                calculatedReward = reward;
            } else {
                calculatedReward = reward * -1
            }

            rewardsToApply.push([neuron.id, calculatedReward]);
        })

        rewardsToApply.forEach(el => {
            this.updateConnectionsWeight(
                el[0],
                found ? el[1] : el[1] * Math.round((Math.random() * 2) - 1)
            )
        });

        return this.connections;
    }

    updateConnectionsWeight(destNeuronId, reward, changed = []) {
        Object.keys(this.connections).forEach((source) => {
            this.connections[source].forEach((dest, idx) => {
                let newWeight = dest[1];
                if(dest[0] === destNeuronId){
                    newWeight += reward;
                    if (!changed.includes(source)){
                        changed.push(source)
                        this.updateConnectionsWeight(source, reward, changed);
                    }
                }
                dest[1] = newWeight > Genes.weightInterval[1]
                    ? Genes.weightInterval[1]
                    : (newWeight < Genes.weightInterval[0]
                        ? Genes.weightInterval[0]
                        : newWeight)
            })
        })
    }
}