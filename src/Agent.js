
const connectionMethods = [
    ['getInputNeurons', 'getProcessingNeurons'],
    // ['getInputNeurons', 'getOutputNeurons'],
    ['getProcessingNeurons', 'getOutputNeurons'],
    // ['getProcessingNeurons', 'getProcessingNeurons'],
]

class Agent extends Observable {
    genes = [];
    neurons = {};
    posVector = null;
    oldPosVector = null;
    id = null;
    observers = new Set();
    alive = null;
    brain = null;
    movements = [];
    parents = [];
    constructor(
        posVector,
        neuronPool,
        genomeSize,
        parents = [],
        rewardFunction
    ){
        super();
        this.posVector = posVector;
        this.oldPosVector = posVector;
        this.neurons = neuronPool;
        this.parents = parents;
        this.alive = true;
        this.genes = new Genes(this.neurons, genomeSize, parents);
        this.initBrain(rewardFunction);

        this.id = Symbol.for(`${this.genes.fingerprint}|${Math.random().toString(36).substring(2,7)}`)
        this.color = `#${this.genes.fingerprint}`
    }

    initBrain(rewardFunction) {
        this.brain = new Brain(this.neurons, this, rewardFunction)
        this.genes.forEach((gene, idx) => {
            this.brain.addConnection(
                this.neurons[this.neurons[connectionMethods[gene[2]][0]]()[gene[0]]].id,
                this.neurons[this.neurons[connectionMethods[gene[2]][1]]()[gene[1]]].id,
                ((this.genes[idx - 1]?.[3] || 1) + (this.genes[idx - 1]?.[4] || 1)) / 2
            )
        })
    }

    update() {
        if (this.alive){
            const result = this.brain.compute();
            this.updatePos();
            this.updateGenesFromConnections(this.brain.evaluate(result))
        }
    }

    updateGenesFromConnections(connections) {
        Object.keys(connections).forEach((key, idx) => {
            this.genes[idx][5] = connections[key][1];
        })
    }

    visualizeNeurons() {
        this.update();
        // const results = this.brain.compute();
        // this.movements = [];
        // return { results }
    }

    move(movement) {
        this.movements.push(movement)
    }

    updatePos() {
        this.oldPosVector = this.posVector
        this.movements.forEach(params => {
            const [vector, method] = params
            this.posVector = this.posVector[method](vector);
        })
        this.movements = [];
        if (!this.notify({
            type: 'updatePos',
            payload: this
        })) {
            this.posVector = this.oldPosVector;
        }
    }

    die(){
        this.alive = false;
        this.oldPosVector = this.posVector
        this.posVector = null;
        this.notify({
            type: 'die',
            payload: this
        })
    }

    get x() {
        return this.posVector[0]
    }
    get y() {
        return this.posVector[1]
    }
}

Agent.size = 2;