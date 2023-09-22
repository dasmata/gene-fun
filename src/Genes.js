class Genes extends Array {
    parents = [];
    limits = {};
    fingerprint = '';
    constructor(neuronPool, size, parents) {
        super();
        this.parents = parents;
        this.size = size;
        this.neurons = neuronPool;
        this.limits = {
            'getInputNeurons': this.neurons.getInputNeurons().length,
            'getOutputNeurons': this.neurons.getOutputNeurons().length,
            'getProcessingNeurons': this.neurons.getProcessingNeurons().length
        }
        this.init();
        this.setFingerprint()
    }
    init(){
        if (this.parents.length < 2) {
            this.generateGenes();
            return;
        }
        for (let i = 0; i < this.size; i++) {
            if (~~(Math.random() * (Genes.mutationFactor + 1)) === Genes.mutationFactor) {
                this.createGene();
                continue;
            }
            this.push(this.parents[~~(Math.random() * 2)][i])
        }
    }

    generateGenes() {
        for(let i = 0; i < this.size; i++){
            this.createGene();
        }
    }

    createGene() {
        const connectionType = ~~(Math.random() * (Object.keys(this.limits).length + 1))
        const maxWeight = (Genes.weightInterval[1] + 1);
        this.push([
            ~~(Math.random() * this.limits[connectionMethods[connectionType][0]]), // neuron
            ~~(Math.random() * this.limits[connectionMethods[connectionType][1]]), // neuron
            connectionType, // connection type
            ~~(Math.random() * maxWeight * (Math.round(Math.random()) ? 1 : -1)), // neuron 1 weight
            ~~(Math.random() * maxWeight * (Math.round(Math.random()) ? 1 : -1)) // neuron 2 weight
        ])
    }

    setFingerprint() {
        this.fingerprint = [...this].map((gene) => {
             return [gene[0] * gene[3], gene[1] * gene[4], ~~(255 / gene[2])];
        }).reduce((acc, values) => {
            return acc.map((el, idx) => el + values[idx])
        }, [0, 0, 0]).reduce((acc, num) => {
            const tmp = (num / 255 * 200);
            const val = tmp < 0 ? 255 + num : num;
            return acc + (val > 255 ? val % 255 : val).toString(16).padStart(2, '0');
        }, '')
    }
}

Genes.mutationFactor = 1000;
Genes.weightInterval = [-4, 4];