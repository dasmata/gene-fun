class Population extends Set{
    populationSize;
    world;
    neuronPool = null;
    genomeSize = 2;

    constructor(world, size){
        super();
        this.neuronPool = neuronPool(world)
        this.world = world;
        this.populationSize = size;
    }
    init () {
        this.createAgents();
        this.placeAgentsOnMap();
    }

    createAgents () {
        for(let i = 0; i < this.populationSize; i++){
            const agent = new Agent(
                new Vector([0,0], [this.world.size.width, this.world.size.height]),
                this.neuronPool,
                this.genomeSize
            );
            agent.attach(this.world);
            this.add(agent, true);
        }
        this.populationSize = this.size;
    }

    placeAgentsOnMap () {
        const agentSize = Agent.size;
        let currentLayer = 25;
        let placed = 0;
        const populationDensity = this.populationSize / ((this.world.size.width) * (this.world.size.height) )

        this.forEach((agent) => {
            const layerStart = currentLayer - agentSize;
            const layerEnd = currentLayer - agentSize;
            const fixed = Math.round(Math.random()) === 1 ? -1 : 0;

            const x = Math.ceil(
                (Math.random() * (layerEnd - (layerStart * fixed)) + (layerStart * fixed)) * (Math.round(Math.random()) === 1 ? -1 : 1) * agentSize
            );
            const y = Math.ceil(
                (Math.random() * (layerEnd - (layerStart * fixed * -1)) + (layerStart * fixed * -1)) * (Math.round(Math.random()) === 1 ? -1 : 1) * agentSize
            );
            placed++
            const layerDensity = (placed / (currentLayer * agentSize * 4))
            if (layerDensity >= populationDensity) {
                currentLayer++;
                placed = 0;
            }

            const coords = new Vector(
                [
                    Math.abs( this.world.size.width - Math.abs((x + (this.world.size.width / 2)))),
                    Math.abs(  this.world.size.height - Math.abs((y + (this.world.size.height / 2))))
                ],
                [this.world.size.width - Agent.size, this.world.size.height - Agent.size]
            );
            agent.posVector = coords;
        });
    }

    add(agent, noRecalculate = false) {
       Set.prototype.add.apply(this,[agent]);
       if (!noRecalculate) {
           this.populationSize = this.size
       }
    }

    replicate(size) {
        const avgOffsprings = 4; //size / (this.size / 2);
        const agents = Array.from(this);
        const newPopulation = new Population(this.world, 0);
        for(let i = 0; i < this.size; i += 2) {
            for (let j = 0; j < avgOffsprings; j++) {
                if(newPopulation.size >= size){
                    break;
                }
                const parents = [(agents?.[i] || agents[i-1]), (agents?.[i+1] || agents[i-2])]
                const agent = new Agent(
                    new Vector([0,0], [this.world.size.width, this.world.size.height]),
                    this.neuronPool,
                    this.genomeSize,
                    parents.map(el => el.genes)
                );
                agent.attach(this.world);
                newPopulation.add(agent);
            }
        }
        console.log(newPopulation.size);
        return newPopulation;
    }
}