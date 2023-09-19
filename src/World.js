class World {
    size = {
        width: null,
        height: null
    };

    agents = new Set();
    locationIdx = new Set();
    status = 0;
    updateLoop = null;
    armageddonLoop = null;
    observers = new Set();

    constructor(size, populationSize, genLife = 10000, actionInterval = 10) {
        this.size = size
        this.agents = new Population(this, populationSize)
        this.agents.init()
        this.runner = this.frame.bind(this);
        this.generationLifeTime = genLife;
        this.actionInterval = actionInterval
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
        const replicators = this.findAllAgents([
            new Vector([
                this.size.width / 2,
                0
            ], [
                this.size.width,
                this.size.height
            ]),
            new Vector([
                this.size.width,
                this.size.height
            ], [
                this.size.width,
                this.size.height
            ]),
        ]);
        const newAgents = replicators.replicate(this.agents.size);
        this.kill();
        this.notify({
            type: 'armageddon'
        });
        this.agents = newAgents;
        this.agents.placeAgentsOnMap();
        this.locationIdx = new Set();
        this.play();
    }

    isOccupied(vector) {
        return this.locationIdx.has(`${vector[0]},${vector[1]}`)
    }

    update(agent) {
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
        const finds = new Population(this)
        intervals.forEach((interval) => {
            this.agents.forEach((agent) => {
                const startVector = interval[0];
                const endVector = interval[1];
                const vector = agent.posVector;
                if (
                    vector[0] >= startVector[0] && vector[0] <= endVector[0]
                    && vector[1] >= startVector[1] && vector[1] <= endVector[1]
                ) {
                    finds.add(agent);
                }
            })
        })
        return finds;
    }

    attach(obs) {
        this.observers.add(obs);
    }

    detach(obs) {
        this.observers.delete(obs)
    }

    notify(e) {
        this.observers.forEach(obs => obs.update(e))
    }
}