import { Observable } from "./Observable.js";

class Supervisor extends Observable {
    size = {
        width: null,
        height: null
    };

    agents = new Set();
    status = 0;
    actionsNr = 0;

    constructor(
        actionsNr,
        population,
    ) {
        super();
        this.agents = population;
        this.actionsNr = actionsNr;
        this.resetFrames();
    }

    resetFrames() {
        this.frameGenerator = (function* (actionsNr){
            for(let i = 1; i <= actionsNr; i++){
                yield {
                    nr: i,
                    hasNext: i !== actionsNr
                };
            }
        })(parseInt(this.actionsNr))
    }

    frame(i) {
        const results = {};
        this.agents.forEach(agent => {
            const agentData = agent.toJSON()
            results[agentData.id] = {
                results: agent.computeNextStep(),
                agent: agent.toJSON()
            };
        })
        this.notify({
            type: 'computed',
            payload: results
        });
    }

    play() {
        this.status = 1;
        const frame = this.frameGenerator.next();
        if (!frame.done) {
            this.frame(frame.value.nr);
            if (!frame.value.hasNext) {
                this.armageddon();
            }
        }
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
        this.resetFrames();
    }

    kill() {
        this.pause();
        this.agents.forEach(el => el.die());
        this.status = 0
    }
}

export { Supervisor }