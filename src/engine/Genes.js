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
            if (Genes.mutationFactor > 0 && Math.round(Math.random() * (Genes.mutationFactor + 1)) === Genes.mutationFactor) {
                this.createGene();
                continue;
            }
            if(!this.parents[0][i] || !this.parents[1][i]){
                this.createGene();
                continue;
            }
            // const parent1Nr = (this.parents[0][i][3] + this.parents[0][i][4]) / 2;
            // const parent2Nr = (this.parents[1][i][3] + this.parents[1][i][4]) / 2;
            this.push(this.parents[Math.round(Math.random())][i])
        }
    }

    generateGenes() {
        for(let i = 0; i < this.size; i++){
            this.createGene();
        }
    }

    createGene() {
        const connectionType = ~~(Math.random() * (connectionMethods.length))
        const maxWeight = (Genes.weightInterval[1] + 1);
        this.push([
            ~~(Math.random() * this.limits[connectionMethods[connectionType][0]]), // neuron
            ~~(Math.random() * this.limits[connectionMethods[connectionType][1]]), // neuron
            connectionType, // connection type
            ~~(Math.random() * maxWeight), // neuron 1 weight
            ~~(Math.random() * maxWeight) // neuron 2 weight
        ])
    }

    setFingerprint() {
        const geneHexa = [...this].map((gene) => {
            return [
                gene[0] * (255 / this.limits[connectionMethods[gene[2]][0]]),
                gene[1] * (255 / this.limits[connectionMethods[gene[2]][1]]),
                (255 / 18) * (gene[3] + gene[4])
            ];
        });
        const genesSums = geneHexa.reduce((acc, values) => {
            return acc.map((el, idx) => el + Math.round(values[idx]))
        }, [0, 0, 0])

        this.fingerprint = genesSums.reduce((acc, val) => {
            return acc + (val > 255 ? val % 255 : val).toString(16).padStart(2, '0');
        }, '');
    }
}

Genes.mutationFactor = 1000;
Genes.weightInterval = [0, 8];