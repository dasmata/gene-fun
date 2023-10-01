importScripts(
    'Observable.js',
    'GenericNeuron.js',
    'Agent.js',
    'Brain.js',
    'Population.js',
    'Genes.js',
    'Supervisor.js',
    '../utils.js'
);

class UpdateWorker extends Observable {
    populationSize;
    minActions;
    neuronPool;
    geneNumber;
    lastResults;

    consecutiveGenerationsEvolving;

    init(data){
        this.populationSize = data.populationSize;
        this.lastResults = {};
        this.minActions = data.minActions;
        this.geneNumber = data.geneNumber;
        this.consecutiveGenerationsEvolving = 0;
        this.loadDependencies(data.dependencies);
        this.createNeuronPool(data.neurons);
        const population = this.populationFactory();
        population.init();
        this.createSupervisor(population);
        this.notify({
            type: 'ready',
            payload: null
        })
    }

    createDescendants(parents){
        const newAgents = this.populationFactory();
        const parentAgents = this.supervisor.agents.find(agent => {
            return parents.find(parent => parent.id === Symbol.keyFor(agent.id))
        });
        if (parents.length > 0) {
            parentAgents.replicate(this.populationSize, newAgents);
        } else {
            newAgents.init();
        }
        this.supervisor.setAgents(newAgents);
        this.notify({
            type: 'ready',
            payload: null
        });
    }

    loadDependencies(deps){
        if (deps) {
            importScripts(...deps);
        }
    }

    createNeuronPool(neurons){
        const lvlIdx = [];
        this.neuronPool = Object.keys(neurons).reduce((acc, neuronType) => {
            acc[neuronType] = new self[neurons[neuronType][0]]({}, neuronType, new Function(`return ${neurons[neuronType][1]}`)());
            lvlIdx[neurons[neuronType][2]] = lvlIdx[neurons[neuronType][2]] || [];
            lvlIdx[neurons[neuronType][2]].push(neuronType);
            this.notify({
                type: 'neuronCreated',
                payload: {
                    id: acc[neuronType].id,
                    type: neuronType,
                    level: neurons[neuronType][2]
                }
            });
            return acc;
        }, {
            getNeuronsForLevel(lvl) {
                return lvlIdx[lvl]
            },
            getNeuronLevelsNum: () => lvlIdx.length
        })
    }

    createSupervisor(population){
        this.supervisor = new Supervisor(
            this.minActions,
            population
        )
        this.supervisor.attach(this);
    }

    populationFactory(){
        return new Population(
            this,
            this.populationSize,
            this.getAgentFactory()
        );
    }

    getAgentFactory(){
        return (parents = []) => {
            const agent = new Agent(
                null,
                this.neuronPool,
                this.geneNumber,
                parents,
                (movements, currentActionValue, agentId) => {
                    this.notify({
                        type: 'aggregateActions',
                        payload: {movements, currentActionValue, agentId}
                    });
                },
                (agent) => {
                    this.notify({
                        type: 'calculateReward',
                        payload: { agent }
                    });
                }
            );
            agent.attach(this)
            this.notify({
                type: 'agentCreated',
                payload: agent.toJSON()
            })
            return agent;
        }
    }

    rpc(data) {
        let ctx = this;
        data.ctxPath.forEach((el) => {
            ctx = ctx[el]
            if (typeof ctx === 'undefined') {
               throw new Error('Invalid rpc context:', el);
            }
        });
        const result = ctx?.[data.method](...data.params);
        this.notify({
            type: 'rpcResponse',
            payload: {
                ...data,
                response: result
            }
        })
    }

    update(e){
        if(e.type === 'computed'){
            this.lastResults = e.payload;
        }
        this.notify(e)
    }

    setAggregatedValues(agents) {
        setTimeout(() => {
            this.supervisor.agents.forEach(agent => {
                const stringId = Symbol.keyFor(agent.id);
                const actionValues = agents[stringId];
                agent.actionValue = actionValues.actionValue;
                agent.oldActionValue = actionValues.oldActionValue;

                if(actionValues.reward){
                    agent.applyReward(actionValues.reward, this.lastResults[stringId].results);
                }
            });
            this.supervisor.play();
        }, 0)
    }

    testRunNeurons(agentId){
        try {
            const agent = [...this.supervisor.agents.find(el => {
                return el.id === Symbol.for(agentId);
            })][0]
            if (!agent) {
                throw new Error('Invalid agent');
            }
            return agent.computeNextStep();
        } catch (e) {
            console.error(e);
            return 0;
        }

    }
}

const worker = new UpdateWorker();
worker.attach({
    update: function(e) {
        if (e.type === 'attached') {
            return;
        }
        switch(e.type){
            case 'aggregateActions':
                if(e.payload.movements.length === 0){
                    return;
                }
                console.log(e)
                break;
            default:
                try{
                    self.postMessage(e);
                } catch (err){
                    console.error(e)
                }
        }
    }
})

self.onmessage = (e) => {
    switch(e.data.type){
        case 'init':
            worker.init(e.data.payload);
            break;
        case 'rpc':
            worker.rpc(e.data.payload)
            break;
        case 'setAggregatedValues':
            worker.setAggregatedValues(e.data.payload.agents);
            break;
        case 'createDescendants':
            worker.createDescendants(e.data.payload)
            break;
    }
}