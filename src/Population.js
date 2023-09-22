class SpawningBounds {
    areaData = [];
    totalSpawnArea = 0;
    populationDensity = 0;
    layerSize = 0;
    currentLayer = 0;
    currentArea = 0;
    placedLayer = 0;
    placedArea = 0;

    constructor(spawningAreas, populationSize) {
        ({ areaData: this.areaData, totalSpawnArea: this.totalSpawnArea } = spawningAreas);
        this.populationDensity = populationSize / this.totalSpawnArea;
        this.layerSize = Agent.size * 3;

    }

    adjustLayer () {
        this.placedLayer++;
        const layerDensity = this.placedLayer / (this.layerSize * this.areaData[this.currentArea].size.width);
        if (layerDensity >= this.populationDensity) {
            this.currentLayer++;
            this.placedLayer = 0;
        }
    }

    adjustArea () {
        this.placedArea++;
        const areaDensity = this.placedArea / this.areaData[this.currentArea].surface;
        if (areaDensity >= this.populationDensity) {
            this.currentArea++;
            this.placedArea = 0;
            this.currentLayer = 0;
            this.placedLayer = 0;
        }
    }

    getBounds () {
        return {
            vStart: (this.currentLayer * this.layerSize) + this.areaData[this.currentArea].location[1],
            vSize: this.layerSize - Agent.size,
            hStart: this.areaData[this.currentArea].location[0],
            hSize: this.areaData[this.currentArea].size.width - Agent.size
        }
    }
}


class Population extends Set {
    populationSize;
    world;
    neuronPool = null;
    genomeSize = 10;
    agentGenerator = null;


    constructor(world, size, agentGenerator){
        super();
        this.neuronPool = neuronPool(world)
        this.world = world;
        this.populationSize = size;
        this.agentGenerator = agentGenerator;
    }
    init () {
        this.createAgents();
        this.placeAgentsOnMap();
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

    getSpawningAreasData() {
        const areaData = this.world.spawnAreas.map(area => {
            const size = area[1].subtract(area[0]).reduce((acc, el, idx) => {
                if (idx) {
                    acc.height = el;
                    return acc;
                }
                acc.width = el;
                return acc;
            }, { width: 0, height: 0 });
            return {
                size,
                location: area[0],
                surface: size.width * size.height
            };
        });
        const totalSpawnArea = areaData.reduce((acc, area) => {
            return acc + (area.size.width * area.size.height)
        }, 0);
        return { areaData, totalSpawnArea }
    }

    placeAgentsOnMap () {
        const boundsObj = new SpawningBounds(this.getSpawningAreasData(), this.size)

        this.forEach((agent) => {
            agent.posVector = Population.getAgentCoords(
                boundsObj.getBounds(),
                Object.values(this.world.size).map(el => el - Agent.size),
                data => !this.world.isOccupied(data)
            );
            boundsObj.adjustLayer();
            boundsObj.adjustArea();
        });
    }

    add(agent, noRecalculate = false) {
       Set.prototype.add.apply(this,[agent]);
       if (!noRecalculate) {
           this.populationSize = this.size
       }
    }

    replicate(size, newPopulation) {
        const avgOffsprings = Math.round(size / (this.size / 1.7));
        console.log(this.size, avgOffsprings, size)
        const agents = shuffle(Array.from(this));
        for(let i = 0; i < this.size; i += 2) {
            const familySize = Math.random() * (avgOffsprings + 2)
            // const familySize = avgOffsprings
            for (let j = 0; j < familySize; j++) {
                // if(newPopulation.size >= size){
                //     break;
                // }
                const parents = [(agents?.[i] || agents[i-1]), (agents?.[i+1] || agents[i-2])]
                const agent = this.generateAgent(parents.map(el => (el || this.generateAgent()).genes));
                agent.attach(this.world);
                newPopulation.add(agent, true);
            }
        }
        console.log(newPopulation.size);
        return newPopulation;
    }
}

Population.getAgentCoords = (bounds, vectorBase, validationFunction) => {
    const x = Math.ceil(
        Math.round(Math.random() * bounds.hSize) + bounds.hStart
    );
    const y = Math.ceil(
        (Math.random() * bounds.vSize) + bounds.vStart
    );

    const coords = new Vector(
        [
            x,
            y
        ],
        vectorBase
    );

    // if(!validationFunction(coords)){
    //     return Population.getAgentCoords(bounds, vectorBase, validationFunction);
    // }

    return coords;
}