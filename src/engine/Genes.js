const connectionMethods = [];

class Genes extends Array {
    parents = [];
    limits = {};
    fingerprint = '';
    useRandomNeuronConnections;
    connectionMethods;
    constructor(neuronPool, size, useRandomNeuronConnections, parents, genes) {
        super();
        this.parents = parents;
        this.size = size;
        this.useRandomNeuronConnections = useRandomNeuronConnections;
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
        if (this.parents.length < 2 || !this.useRandomNeuronConnections) {
            this.generateGenes();
            return;
        }
        if(this.useRandomNeuronConnections){
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
        } else {
            let cursor = 0
            this.connectionMethods.forEach((levels, idx) => {
                for(let i = 0; i <= this.limits[levels[0]]; i++){
                    this.push(this.parents[Math.round(Math.random())][cursor++]);
                }
            });
        }
    }

    generateGenes() {
        if(this.useRandomNeuronConnections){
            for(let i = 0; i < this.size; i++){
                this.createGene();
            }
        } else {
            const maxWeight = (Genes.weightInterval[1] + 1);
            this.connectionMethods.forEach((levels, idx) => {
                for(let i = 0; i <= this.limits[levels[0]]; i++){
                    for(let j = 0; j <= this.limits[levels[1]]; j++){
                        this.push([i, j, idx, ~~(Math.random() * maxWeight), ~~(Math.random() * maxWeight)])
                    }
                }
            });
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
Genes.weightInterval = [-10, 10];