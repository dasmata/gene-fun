class Map extends Observable{
    size = {
        width: 0,
        height: 0
    }
    levels = [];
    level = 0;
    population;
    breedingAreas = [];
    spawnAreas = [];
    walls = [];
    locationIdx;

    constructor(size, levels, level = 0) {
        super();
        this.size = size;
        this.levels = levels;
        this.locationIdx = new Set();
        this.level = level;
        this.initLevel();
    }

    setPopulation(population) {
        this.population = population;
    }

    initLevel() {
        this.walls = this.levels[this.level].walls;
        this.spawnAreas = this.levels[this.level].spawnAreas;
        this.breedingAreas = this.levels[this.level].breedingAreas;
    }

    getSpawningAreasData() {
        const areaData = this.spawnAreas.map(area => {
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
        const boundsObj = new SpawningBounds(this.getSpawningAreasData(), this.population.size)

        this.population.forEach((agent) => {
            agent.actionValue = Map.getAgentCoords(
                boundsObj.getBounds(),
                Object.values(this.size).map(el => el - Map.agentSize),
                data => !this.isOccupied(data)
            );
            boundsObj.adjustLayer();
            boundsObj.adjustArea();
        });
    }

    isOccupied(vector) {
        return this.locationIdx.has(`${vector[0]},${vector[1]}`)
            || this.locationIdx.has(`${vector[0] - 1},${vector[1]}`)
            || this.locationIdx.has(`${vector[0]},${vector[1] + 1}`)
            || this.walls.reduce((acc, wall) => {
                if (acc) {
                    return acc;
                }
                return vector[0] >= wall[0][0]
                    && vector[0] <= wall[1][0]
                    && vector[1] >= wall[0][1]
                    && vector[1] <= wall[1][1]
            }, false);
    }

    canReach(startVector, endVector){
        if(startVector.equals(endVector)){
            return true;
        }

        const deltaX = endVector[0] - startVector[0];
        const deltaY = endVector[1] - startVector[1];
        const lineGradient = deltaY > 0 ? Math.round((deltaX) / (deltaY)) : 0;

        const limit = Math.max(Math.abs(deltaX), Math.abs(deltaY));
        const xSign = deltaX < 0 ? -1 : 1;
        const ySign = deltaY < 0 ? -1 : 1;

        const path = [];
        const base = Object.values(this.size);
        for(let i = 1; i <= limit; i++){
            if(deltaX === 0){
                path.push(new Vector([
                    endVector[0],
                    startVector[1] + (i * ySign)
                ], base))
                continue;
            }
            if(deltaY === 0){
                path.push(new Vector([
                    startVector[0] + (i * xSign),
                    endVector[1]
                ], base))
                continue;
            }
            const pointDeltaX = i === limit ? deltaX : Math.round(deltaX / (limit - i));
            const pointX = startVector[0] + pointDeltaX;

            const pointDeltaY = i === limit ? deltaY : Math.round(deltaY / (limit - i));
            const pointY = startVector[1] + pointDeltaY
            path.push(new Vector([
                pointX,
                pointY
            ], base))
        }
        for(const i in path){
            if(this.isOccupied(path[i])){
                return false;
            }
        }
        return true;
    }

    findAllAgents(searchAreas){
        const intervals = searchAreas || this.breedingAreas;
        const shuffledIntervals = shuffle(intervals);
        const agentsPerArea = [];
        const foundAgents = this.population.find((agent) => {
            for(let i in shuffledIntervals){
                const interval = shuffledIntervals[i];
                const startVector = interval[0];
                const endVector = interval[1];
                const vector = agent.oldActionValue;
                if(vector[0] >= startVector[0] && vector[0] <= endVector[0]
                    && vector[1] >= startVector[1] && vector[1] <= endVector[1]){
                    agentsPerArea[i] = (agentsPerArea[i] || 0) + 1;
                    return true;
                }
            }
            return false;
        });
        return [foundAgents, agentsPerArea];
    }

    findAgent(vector) {
        return Array.from(this.population).reduce((acc, agent) => {
            if (acc) {
                return acc
            }
            const startVector = agent.actionValue
            const endVector = startVector.add(new Vector([Map.agentSize-1, Map.agentSize-1], [this.size.width, this.size.height]))
            if (
                vector[0] >= startVector[0] && vector[0] <= endVector[0]
                && vector[1] >= startVector[1] && vector[1] <= endVector[1]
            ) {
                return agent
            }
        }, null)
    }

    nextLevel() {
        this.level++;
        if(!this.levels[this.level]){
            this.notify({
                type: 'taskComplete'
            });
            return;
        }
        this.initLevel();
        this.notify({
            type: 'levelUp'
        });
    }

    update(e) {
        if(e.type === 'attached' && e.payload !== this){
            return;
        }
        const agent = e.payload;
        const oldActionValue = agent.oldActionValue;

        if (agent.alive) {
            const newActionValue = agent.actionValue;
            if (!this.canReach(oldActionValue, newActionValue)) {
                return false
            }
            if(oldActionValue && this.locationIdx.has(`${oldActionValue[0]},${oldActionValue[1]}`)){
                this.locationIdx.delete(`${oldActionValue[0]},${oldActionValue[1]}`);
            }
            this.locationIdx.add(`${newActionValue[0]},${newActionValue[1]}`);
            return true;
        }
        if(oldActionValue && this.locationIdx.has(`${oldActionValue[0]},${oldActionValue[1]}`)){
            this.locationIdx.delete(`${oldActionValue[0]},${oldActionValue[1]}`);
        }
        agent.detach(this)
    }
}

Map.getAgentCoords = (bounds, vectorBase, validationFunction) => {
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

Map.agentSize = 2;