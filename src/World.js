const shuffle = arr => {
    let currentIndex = arr.length;
    let randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }

    return arr;
}

class World extends Observable {
    size = {
        width: null,
        height: null
    };

    agents = new Set();
    locationIdx = new Set();
    status = 0;
    updateLoop = null;
    armageddonLoop = null;
    breedingAreas = [];
    spawnAreas = [];
    walls = [];
    populationFactory;
    levels = [];
    level = 0;

    constructor(
        size,
        genLife = 10000,
        actionInterval = 10,
        levels,
        populationFactory,
    ) {
        super();
        this.size = size;

        this.levels = levels;
        this.generationLifeTime = genLife;
        this.actionInterval = actionInterval;
        this.initLevel();
        this.runner = this.frame.bind(this);
        this.agents = populationFactory(this);
        this.agents.init();
        this.populationFactory = populationFactory;
    }

    initLevel() {
        this.walls = this.levels[this.level].walls;
        this.spawnAreas = this.levels[this.level].spawnAreas;
        this.breedingAreas = this.levels[this.level].breedingAreas;
    }

    frame() {
        this.agents.forEach(agent => agent.update())
        if (this.status && !this.updateLoop ) {
            this.updateLoop = setInterval(this.runner, this.actionInterval)
        }
    }

    play() {
        if (this.status) {
            return
        }
        this.status = 1;
        this.runner();
        this.armageddonLoop = setInterval(() => {
            this.armageddon();
        }, this.generationLifeTime);
    }

    pause() {
        if (this.status && this.updateLoop) {
            this.status = 0;
            clearInterval(this.updateLoop);
            clearInterval(this.armageddonLoop);
            this.updateLoop = null;
            this.armageddonLoop = null;
        }
    }

    armageddon() {
        this.pause();
        const replicators = this.findAllAgents(...this.breedingAreas);
        if(replicators.size >= this.agents.populationSize) {
            this.level++;
            if(!this.levels[this.level]){
            this.notify({
                type: 'taskComplete'
            });
                return;
            }
            this.initLevel();
            this.startNewGen(replicators);
            this.notify({
                type: 'levelUp'
            });
            return;
        }
        const newAgents = this.populationFactory(this);
        if (replicators.size > 0) {
            replicators.replicate(this.agents.populationSize, newAgents);
        } else {
            newAgents.init();
        }
        this.kill();
        this.startNewGen(newAgents);
        this.notify({
            type: 'armageddon'
        });
    }

    startNewGen(population){
        this.agents = population;
        this.locationIdx = new Set();
        this.agents.placeAgentsOnMap();
        this.play();
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

    update(e) {
        if(e.type === 'attached' && e.payload !== this){
            return;
        }
        const agent = e.payload;
        const oldVector = agent.revertPos;

        if (agent.alive) {
            const newVector = agent.posVector;
            if (this.isOccupied(newVector)) {
                return false
            }
            if(oldVector && this.locationIdx.has(`${oldVector[0]},${oldVector[1]}`)){
                this.locationIdx.delete(`${oldVector[0]},${oldVector[1]}`);
            }
            this.locationIdx.add(`${newVector[0]},${newVector[1]}`);
            return true;
        }
        if(oldVector && this.locationIdx.has(`${oldVector[0]},${oldVector[1]}`)){
            this.locationIdx.delete(`${oldVector[0]},${oldVector[1]}`);
        }
        window.requestAnimationFrame(() => {
            agent.detach(this)
            this.agents.delete(agent)
        })
    }

    kill() {
        this.agents.forEach(el => el.die());
        this.status = 0
    }

    findAgent(vector) {
        return Array.from(this.agents).reduce((acc, agent) => {
            if (acc) {
                return acc
            }
            const startVector = agent.posVector
            const endVector = startVector.add(new Vector([Agent.size-1, Agent.size-1], [this.size.width, this.size.height]))
            if (
                vector[0] >= startVector[0] && vector[0] <= endVector[0]
                && vector[1] >= startVector[1] && vector[1] <= endVector[1]
            ) {
                return agent
            }
        }, null)
    }

    findAllAgents(...intervals){
        const finds = this.populationFactory(this);
        const shuffledIntervals = shuffle(intervals);
        shuffledIntervals.forEach((interval) => {
            let nr = 0;
            this.agents.forEach((agent) => {
                const startVector = interval[0];
                const endVector = interval[1];
                const vector = agent.posVector;
                if (
                    vector[0] >= startVector[0] && vector[0] <= endVector[0]
                    && vector[1] >= startVector[1] && vector[1] <= endVector[1]
                ) {
                    finds.add(agent);
                    nr++;
                }
            })
            console.log(`${interval[0][0]},${interval[0][1]}${interval[1][0]},${interval[1][1]}: `, nr);
        })
        return finds;
    }
}