
class Agent extends Observable {
    genes = [];
    neurons = {};
    actionValue = null;
    oldActionValue = null;
    id = null;
    observers = new Set();
    alive = null;
    brain = null;
    requestedActions = [];
    parents = [];
    actionsAggregator = () => {};
    
    constructor(
        actionValue,
        neuronPool,
        genomeSize,
        useRandomNeuronConnections,
        parents = [],
        actionsAggregator,
        rewardFunction,
        genes,
        id
    ){
        super();
        this.actionValue = actionValue;
        this.oldActionValue = actionValue;
        this.neurons = neuronPool;
        this.parents = parents;
        this.alive = true;
        this.genes = new Genes(this.neurons, genomeSize, useRandomNeuronConnections, parents, genes);
        this.initBrain(rewardFunction);
        this.actionsAggregator = actionsAggregator;

        this.id = Symbol.for(id || `${this.genes.fingerprint}|${Math.random().toString(36).substring(2,7)}`)
    }

    initBrain(rewardFunction) {
        this.brain = new Brain(this.neurons, this, rewardFunction)
        this.genes.forEach((gene, idx) => {
            this.brain.addConnection(
                this.neurons[this.neurons.getNeuronsForLevel(this.genes.connectionMethods[gene[2]][0])[gene[0]]].id,
                this.neurons[this.neurons.getNeuronsForLevel(this.genes.connectionMethods[gene[2]][1])[gene[1]]].id,
                ((this.genes[idx - 1]?.[3] || 1) + (this.genes[idx - 1]?.[4] || 1)) / 2,
                idx
            )
        })
    }

    computeNextStep() {
        if(this.alive){
            return this.brain.compute();
        }
    }

    applyReward(reward, result) {
        this.updateGenesFromConnections(this.brain.evaluate(result, reward))
    }

    updateGenesFromConnections(connections) {
        Object.keys(connections).forEach((key, idx) => {
            connections[key].forEach(dest => {
                const val = dest[1];
                this.genes[dest[2]][3] = val;
                this.genes[dest[2]][4] = val;
            })
        })
    }

    visualizeNeurons() {
        this.update();
    }


    die(){
        this.alive = false;
        this.oldActionValue = this.actionValue
        this.actionValue = null;
        this.notify({
            type: 'die',
            payload: this.toJSON()
        })
    }

    toJSON(){
        return {
            actionValue: this.actionValue,
            oldActionValue: this.oldActionValue,
            id: Symbol.keyFor(this.id),
            genes: this.genes.toJSON()
        }
    }
}