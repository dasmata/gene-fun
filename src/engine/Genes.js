const connectionMethods = [];

class Genes extends Array {
    parents = [];
    limits = {};
    fingerprint = '';
    connectionMethods;
    constructor(neuronPool, size, parents, genes) {
        super();
        this.parents = parents;
        this.size = size;
        this.neurons = neuronPool;
        this.connectionMethods = [];
        this.limits = Array.from(new Array(this.neurons.getNeuronLevelsNum?.()).keys()).map((el, idx) => {
            return this.neurons.getNeuronsForLevel?.(idx).length - 1
        });
        for(let i = 0; i < this.limits.length - 1; i++){
            const next = i + 1;
            if(!next){
                break;
            }
            this.connectionMethods.push([i, next])
        }
        if(genes) {
            genes.forEach(gene => this.push(gene));
        } else {
            this.init();
        }
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
            this.push(this.parents[Math.round(Math.random())][i])
        }
    }

    generateGenes() {
        for(let i = 0; i < this.size; i++){
            this.createGene();
        }
    }

    createGene() {
        const connectionType = ~~(Math.random() * (this.connectionMethods.length))
        const maxWeight = (Genes.weightInterval[1] + 1);
        this.push([
            ~~(Math.random() * (this.limits[this.connectionMethods[connectionType][0]] + 1)), // neuron
            ~~(Math.random() * (this.limits[this.connectionMethods[connectionType][1]] + 1)), // neuron
            connectionType, // connection type
            ~~(Math.random() * maxWeight), // neuron 1 weight
            ~~(Math.random() * maxWeight) // neuron 2 weight
        ]);
    }

    setFingerprint() {
        const geneHexa = [...this].map((gene) => {
            return [
                gene[0] * (255 / this.limits[this.connectionMethods[gene[2]][0]]),
                gene[1] * (255 / this.limits[this.connectionMethods[gene[2]][1]]),
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

    toJSON(){
        return {
            data: [...this],
            fingerprint: this.fingerprint
        }
    }

    toString(){
        return JSON.stringify([...this])
    }
}

Genes.mutationFactor = 1000;
Genes.weightInterval = [0, 8];