const CONNECTION_TYPE = {
    INPROC: 0,
    INOUT: 1,
    PROCOUT: 2,
    PROCPROC: 3
}

const connectionMethods = [
    ['getInputNeurons', 'getProcessingNeurons'],
    ['getInputNeurons', 'getOutputNeurons'],
    ['getProcessingNeurons', 'getOutputNeurons'],
    ['getProcessingNeurons', 'getProcessingNeurons'],
]

class Agent {
    genes = [];
    neurons = {};
    posVector = null;
    oldPosVector = null;
    id = null;
    observers = new Set();
    alive = null;
    brain = [];
    movements = [];
    parents = [];
    constructor(posVector, neuronPool, genomeSize, parents = []){
        this.posVector = posVector;
        this.oldPosVector = posVector;
        this.neurons = neuronPool;
        this.parents = parents;
        this.alive = true;
        this.genes = new Genes(this.neurons, genomeSize, parents);
        this.initBrain();

        this.id = Symbol.for(`${this.genes.fingerprint},${this.x},${this.y}`)
        this.color = `#${this.genes.fingerprint}`
    }

    initBrain() {
        this.genes.forEach((gene, idx) => {
            this.brain.push(
                [this.neurons[connectionMethods[gene[2]][0]]()[gene[0]], this.genes[idx - 1]?.[3] || 1]
            );
            this.brain.push(
                [this.neurons[connectionMethods[gene[2]][1]]()[gene[1]], this.genes[idx - 1]?.[4] || 1]
            );
        })
    }

    update() {
        if (this.alive){
            this.brain.reduce((acc, neuron) => {
                const neuronObj =  this.neurons[neuron[0]];
                const result = neuronObj.main(this, acc, neuron[1])
                if (neuronObj.type === 2){
                    return null;
                }
                return result;
            }, null)
            this.updatePos();
        }
    }

    visualizeNeurons() {
        const steps = []
        const result = this.brain.reduce((acc, neuron) => {
            console.log(neuron)
            const tmp = this.neurons[neuron[0]].main(this, acc, neuron[1]);
            steps.push(tmp)
            return tmp
        }, 0)
        return {steps, result}
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
        if (!this.notify()) {
            this.posVector = this.oldPosVector;
        }
    }

    die(){
        this.alive = false;
        this.oldPosVector = this.posVector
        this.posVector = null;
        this.notify()
    }

    notify() {
        /* not happy by this solution because:
            1. it is not consistent (this can be fixed. see below)
            2. it allows data from outside the process (not requested by the process) to change the process behaviour
           The world object is the only one who knows if a point on the map is free or occupied by another agent.
           If the point on the map where the agent is trying to move is occupied (not free) the movement should be prevented.
           If the world observer returns false, the movement is aborted.
           This is similar to the event propagation mechanism found in Vanilla JS but in this case it is not consistently implemented
           wherever an observer pattern is used.
         */
        let revertSignal = true;
        this.observers.forEach(obj => revertSignal = obj.update(this))
        return revertSignal
    }

    attach(obj) {
        this.observers.add(obj)
        this.notify()
    }

    detach(obj) {
       this.observers.delete(obj)
    }

    get x() {
        return this.posVector[0]
    }
    get y() {
        return this.posVector[1]
    }
}

Agent.size = 2;