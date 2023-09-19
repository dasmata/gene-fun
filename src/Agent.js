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
    revertPos = null;
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

        this.initGenome(genomeSize);
        this.initBrain();

        const genomeFingerprint = this.genes.reduce((acc, gene) => {
            return acc.map((el, idx) => {
                return el + gene[idx]
            })
        }, [0, 0, 0])
        this.id = Symbol.for(`${genomeFingerprint},${this.x},${this.y}`)
        this.color = `#${(~~(255/genomeFingerprint[1])).toString(16).padStart(2,'0')}${(~~(255/genomeFingerprint[2])).toString(16).padStart(2,'0')}${(~~(255/genomeFingerprint[3])).toString(16).padStart(2,'0')}`
    }

    initGenome(size){
        if (this.parents.length < 2) {
            this.generateGenes(size);
            return;
        }
        for (let i = 0; i < size; i++) {
            this.genes.push(this.parents[~~(Math.random() * 2)][i])
        }
    }

    generateGenes(size) {
        const limits = {
            'getInputNeurons': this.neurons.getInputNeurons().length,
            'getOutputNeurons': this.neurons.getOutputNeurons().length,
            'getProcessingNeurons': this.neurons.getProcessingNeurons().length
        }

        for(let i = 0; i < size; i++){
            const connectionType = ~~(Math.random() * 4)
            this.genes.push([
                ~~(Math.random() * limits[connectionMethods[connectionType][0]]), // neuron
                ~~(Math.random() * limits[connectionMethods[connectionType][1]]), // neuron
                connectionType, // connection type
                ~~(Math.random() * 5 * (Math.round(Math.random()) ? 1 : -1)), // neuron 1 weight
                ~~(Math.random() * 5 * (Math.round(Math.random()) ? 1 : -1)) // neuron 2 weight
            ])
        }
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
        this.revertPos = this.posVector;
        this.movements.forEach(params => {
            const [vector, method] = params
            this.posVector = this.posVector[method](vector);
        })
        this.movements = [];
        if (!this.notify()) {
            this.posVector = this.revertPos;
        }
        this.revertPos = null;
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
           Hence, the revertSignal and the revertPos. I could not use oldPos because that is used by the renderer. It is also updated
           and maintained based on the framerate (the agent can change its position multiple times per frame).
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