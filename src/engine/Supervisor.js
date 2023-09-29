class Supervisor extends Observable {
    size = {
        width: null,
        height: null
    };

    agents = new Set();
    status = 0;
    updateLoop = null;
    armageddonLoop = null;
    actionsNr = 0;

    constructor(
        genLife = 10000,
        actionInterval = 10,
        actionsNr,
        population,
    ) {
        super();
        this.generationLifeTime = genLife;
        this.actionInterval = actionInterval;
        this.runner = this.frame.bind(this);
        this.agents = population;
        this.actionsNr = actionsNr
    }



    frame() {
        const start = performance.mark('update-start');
        this.agents.forEach(agent => agent.update())
        const end = performance.mark('update-end');
        const duration = end.startTime - start.startTime;
        if(duration > this.actionInterval){
            this.actionInterval++;
        // } else if (duration * 0.4 < this.actionInterval) {
        //     this.actionInterval--;
        }
        this.generationLifeTime = this.actionInterval * this.actionsNr;
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
        const start = performance.mark('update-start');
        this.armageddonLoop = setInterval(() => {
            this.armageddon();
            const end = performance.mark('update-end');
            console.log('Generation lifetime', end.startTime - start.startTime);
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
        this.kill();
        this.notify({
            type: 'armageddon'
        });
    }

    setAgents(population){
        this.agents = population;
    }

    kill() {
        this.pause();
        this.agents.forEach(el => el.die());
        this.status = 0
    }
}