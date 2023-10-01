class Population extends Set {
    populationSize;
    supervisor;
    neuronPool = null;
    agentGenerator = null;


    constructor(ctx, size, agentGenerator){
        super();
        this.neuronPool = ctx.neuronPool
        this.supervisor = ctx;
        this.populationSize = size;
        this.agentGenerator = agentGenerator;
    }
    init () {
        this.createAgents();
    }

    createAgents () {
        for(let i = 0; i < this.populationSize; i++) {
            const agent = this.generateAgent()
            this.add(agent, true);
        }
        this.populationSize = this.size;
    }

    generateAgent(parents) {
        return this.agentGenerator(parents);
    }

    add(agent, noRecalculate = false) {
       Set.prototype.add.apply(this,[agent]);
       if (!noRecalculate) {
           this.populationSize = this.size
       }
    }

    replicate(size, newPopulation) {
        const avgOffsprings = Math.round(size / (this.size / 1.7));
        const agents = shuffle(Array.from(this));
        for(let i = 0; i < this.size; i += 2) {
            const familySize = Math.round((Math.random() * 2) + avgOffsprings);
            for (let j = 0; j < familySize; j++) {
                const parents = [(agents?.[i] || agents[i-1]), (agents?.[i+1] || agents[i-2])]
                const agent = this.generateAgent(parents.map(el => (el || this.generateAgent()).genes));
                agent.attach(this.supervisor);
                newPopulation.add(agent, true);
            }
        }
        return newPopulation;
    }

    find(callback){
        const finds = new this.constructor(this.supervisor, this.populationSize, this.agentGenerator)
        this.forEach((agent) => {
            if(callback(agent)){
                finds.add(agent, true);
            }
        });
        return finds;
    }

    toString(){
        return Array.from(this).toString();
    }
}
