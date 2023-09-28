
const connectionMethods = [
    ['getInputNeurons', 'getProcessingNeurons'],
    // ['getInputNeurons', 'getOutputNeurons'],
    ['getProcessingNeurons', 'getOutputNeurons'],
    // ['getProcessingNeurons', 'getProcessingNeurons'],
]

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
        parents = [],
        actionsAggregator,
        rewardFunction
    ){
        super();
        this.actionValue = actionValue;
        this.oldActionValue = actionValue;
        this.neurons = neuronPool;
        this.parents = parents;
        this.alive = true;
        this.genes = new Genes(this.neurons, genomeSize, parents);
        this.initBrain(rewardFunction);
        this.actionsAggregator = actionsAggregator

        this.id = Symbol.for(`${this.genes.fingerprint}|${Math.random().toString(36).substring(2,7)}`)
    }

    initBrain(rewardFunction) {
        this.brain = new Brain(this.neurons, this, rewardFunction)
        this.genes.forEach((gene, idx) => {
            this.brain.addConnection(
                this.neurons[this.neurons[connectionMethods[gene[2]][0]]()[gene[0]]].id,
                this.neurons[this.neurons[connectionMethods[gene[2]][1]]()[gene[1]]].id,
                ((this.genes[idx - 1]?.[3] || 1) + (this.genes[idx - 1]?.[4] || 1)) / 2,
                idx
            )
        })
    }

    update() {
        if (this.alive){
            const result = this.brain.compute();
            this.updateActionValue();
            this.updateGenesFromConnections(this.brain.evaluate(result))
        }
    }

    updateGenesFromConnections(connections) {
        Object.keys(connections).forEach((key, idx) => {
            connections[key].forEach(dest => {
                const val = dest[1] * 2;
                this.genes[dest[2]][3] = val;
                this.genes[dest[2]][4] = val;
            })
        })
    }

    visualizeNeurons() {
        this.update();
    }

    requestAction(action) {
        this.requestedActions.push(action)
    }

    updateActionValue() {
        this.oldActionValue = this.actionValue;
        this.actionValue = this.actionsAggregator(this.requestedActions, this.actionValue);
        this.requestedActions = [];
        if (!this.notify({
            type: 'updateActionValue',
            payload: this
        })) {
            this.actionValue = this.oldActionValue;
        }
    }

    die(){
        this.alive = false;
        this.oldActionValue = this.actionValue
        this.actionValue = null;
        this.notify({
            type: 'die',
            payload: this
        })
    }

    get x() {
        return this.actionValue[0]
    }
    get y() {
        return this.actionValue[1]
    }
}