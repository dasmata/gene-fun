import { shuffle } from "./utils.js";

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

    replicate(size, parents) {
        const avgOffsprings = Math.round(size / (parents.length / 1.7));
        const agents = shuffle(parents);
        for(let i = 0; i < parents.length; i += 2) {
            const familySize = Math.round((Math.random() * 2) + avgOffsprings);
            for (let j = 0; j < familySize; j++) {
                const parents = [(agents?.[i] || agents[i-1]), (agents?.[i+1] || agents[i-2])]
                const agent = this.generateAgent(parents.map(el => (el?.genes?.data || this.generateAgent().genes)));
                agent.attach(this.supervisor);
                this.add(agent, true);
            }
        }
        return this;
    }
    toJSON(){
        return Array.from(this).map(el => el.toJSON());
    }
}

export { Population }