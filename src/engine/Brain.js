class Brain extends Observable {
    levels = []
    connections = {};
    connectionsDestIdx = {};
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

    addConnection(neuron1, neuron2, weight, id) {
        this.connections[neuron1] = this.connections[neuron1] || [];
        this.connections[neuron1].push([neuron2, weight, id]);
        this.connectionsDestIdx[neuron2] = this.connectionsDestIdx[neuron2] || [];
        this.connectionsDestIdx[neuron2].push([neuron1, weight, id]);
    }

    weightFunction(inputs, weights) {
        let weightSum = 0
        const weightedInputs =  inputs.reduce((acc, el, idx) => {
            weightSum += weights[idx]
            return acc + (el * weights[idx]);
        }, 0);
        return weightSum <= 2 ? 0 : weightedInputs / weightSum;
    }

    compute() {
        const totalLevels = this.levels.length - 1;
        const results = this.levels.reduce((lvlResults, lvl, i) => {
            if (lvlResults) {
                lvl.forEach(neuron => {
                    const connections = this.connectionsDestIdx[neuron.id];
                    if (!connections) {
                        return;
                    }
                    const prevResults = connections.reduce((sums, el) => {
                        if(!lvlResults[el[0]]){
                            return sums;
                        }
                        sums[0].push(lvlResults[el[0]].val);
                        sums[1].push(el[1])
                        sums[2].push(lvlResults[el[0]].id)

                        return sums;
                    }, [[], [], []])
                    const inputVal = Math.round(this.weightFunction(prevResults[0], prevResults[1]));
                    const outputVal = neuron.main(this.agent, inputVal);
                    lvlResults[neuron.id] = {val: outputVal, prev: prevResults, id: neuron.id, weightedInput: inputVal};
                })
            } else {
                lvlResults = lvl.reduce((acc, neuron) => {
                    if(this.connections[neuron.id]) {
                        acc[neuron.id] = {val: neuron.main(this.agent), prev: null, id: neuron.id};
                    }
                    return acc;
                }, {})
            }
            return lvlResults;
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

            rewardsToApply.push([neuron.id, calculatedReward < -8 ? -8 : (calculatedReward > 8 ? 8 : calculatedReward)]);
        })

        rewardsToApply.forEach(el => {
            this.updateConnectionsWeight(
                el[0],
                // this seems to be very important for some reason. can't remember WHY it's here tho
                found ? el[1] : el[1]  * Math.round((Math.random() * 2) - 1)
            )
        });
        return this.connections;
    }

    updateConnectionsWeight(destNeuronId, reward, changed = []) {
        const computed = [];
        this.connectionsDestIdx[destNeuronId].forEach((connection, idxDest) => {
            connection[1] = Math.min(Math.max(connection[1] + reward, Genes.weightInterval[0]), Genes.weightInterval[1]);
            // for multiple connections between same neurons, only apply de reward once to each connection
            if(!computed.includes(connection[0])){
                this.connections[connection[0]].forEach((conn, idxSource) => {
                    if(conn[0] === destNeuronId){
                        // if there are multiple connection the new weight value must be calculated for each one
                        conn[1] = Math.min(Math.max(conn[1] + reward, Genes.weightInterval[0]), Genes.weightInterval[1]);
                    }
                })
                // go up the connections chain
                if(this.connectionsDestIdx[connection[0]]){
                    this.updateConnectionsWeight(connection[0], reward)
                }
                computed.push(connection[0])
            }
        })
    }
}