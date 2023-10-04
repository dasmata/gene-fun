importScripts(
    'WorkerMessageBus.js',
    'utils.js'
)

class WorkerMaster {
    workers;
    messageBus;
    clientMessages;

    agentsIdx;

    constructor(){
        this.workers = [];
        this.agentsIdx = {};
        this.clientMessenger = this.clientMessengerFactory();
        this.clientMessages = {};
    }

    init({ payload }){
        const workersNum = 1;//~~(navigator.hardwareConcurrency * payload.config.workers);
        for(let i = 0; i < workersNum; i++){
            this.workers[i] = new Worker('UpdateWorker.js');
        }
        this.messageBus = WorkerMessageBus(this.workers);

        const unsubAgentCreated = this.messageBus.subscribe('agentCreated', (msg) => {
            this.agentsIdx[msg.data.payload.id] = this.workers.indexOf(msg.target);
            this.clientMessenger.send(msg.data);
        });

        const unsubNeuronCreated = this.messageBus.subscribe('neuronCreated', (msg) => {
            const msgId = this.clientMessenger.send(msg.data);
            this.clientMessages[msgId] = {
                data: msg.data,
                initiator: msg.target
            };
        });

        const unsubReady = this.messageBus.subscribe('ready', (data) => {
            unsubReady()
            unsubAgentCreated();
            unsubNeuronCreated();
            this.clientMessenger.send({
                type: 'ready',
                payload: null
            })
        });
        this.messageBus.publish('init', {
            ...payload,
            populationSize: payload.populationSize / workersNum
        });
        this.handleArmageddon();

    }

    handleArmageddon() {
        let events = [];
        const unsubArmageddon = this.messageBus.subscribe('armageddon', e => {
            events[this.workers.indexOf(e.target)] = true;
            if(events.length === this.workers.length && !events.includes(undefined)){
                this.clientMessenger.send({
                    type: 'armageddon'
                });
                events = [];
            }
        });
    }

    createDescendants({ payload }) {
        this.agentsIdx = {};
        let importRequestId = null;
        const unsubAgentCreated = this.messageBus.subscribe('agentCreated', (msg) => {
            this.agentsIdx[msg.data.payload.id] = this.workers.indexOf(msg.target);
            this.clientMessenger.send(msg.data);
        });
            const unsubDescendantsCreated = this.messageBus.subscribe('descendantsCreated', e => {
                unsubDescendantsCreated();
                const perWorker = Math.ceil(e.data.payload.length / this.workers.length);
                console.log(perWorker)
                this.workers.forEach((worker, idx) => {
                    importRequestId = this.messageBus.publish(
                        'importAgents',
                        { agents: e.data.payload.slice(idx * perWorker, (idx + 1) * perWorker) },
                        worker,
                        importRequestId
                    )
                });
            });
            debugger;
            const unsubAllAgentsReady = this.messageBus.subscribe('ready', (data) => {
                unsubAllAgentsReady()
                this.clientMessenger.send({
                    type: 'ready',
                    payload: null
                });
            });


        this.messageBus.publish('createDescendants', {
            parents: payload,
            size: 1000
        }, this.workers[Math.round(Math.random() * this.workers.length)]);
    }

    clientMessengerFactory() {
        let id = 0;
        self.addEventListener('message', e => {
            this[e.data.type]?.(e.data);
        });
        return {
            send(data){
                self.postMessage({
                    ...data,
                    msgId: ++id
                });
                return id;
            }
        }
    }

    setAggregatedValues(data){
        const computedValues = [];
        const unsubComputed = this.messageBus.subscribe('computed', msg => {
            computedValues[this.workers.indexOf(msg.target)] = msg.data.payload
            if(computedValues.length === this.workers.length && !computedValues.includes(undefined)){
                this.clientMessenger.send({
                    type: 'computed',
                    payload: Object.assign(...computedValues)
                });
                unsubComputed();
            }
        });

        const agents = data.payload.agents;
        const messages = this.workers.map(el => ({}));
        Object.keys(agents).forEach(agentId => {
            messages[this.agentsIdx[agentId]][agentId] = agents[agentId];
        });
        messages.map((workerAgents, idx) => {
            return this.messageBus.publish(data.type, {agents: workerAgents}, this.workers[idx])
        });
    }

    setAgentsActionValues(data) {
        if(data.type === 'rpc'){
            const agents = data.payload.params[0];
            const messages = this.workers.map(el => ({}));
            Object.keys(agents).forEach(agentId => {
                messages[this.agentsIdx[agentId]][agentId] = agents[agentId];
            });
            messages.map((workerAgents, idx) => {
                return this.messageBus.publish('rpc', {
                    ...data.payload,
                    params: [workerAgents]
                }, this.workers[idx])
            });
            return;
        }

    }

    rpc(data){
        if(data.reqId) {
            this.messageBus.publish(data.type, data.payload, this.clientMessages[data.reqId]?.initiator);
            return;
        }
        if(data.payload.ctxPath.length === 0){
            this[data.payload.method]?.(data);
        }
    }
}

const master = new WorkerMaster();

self.onmessage = (e) => {
    return;
    switch(e.data.type){
        case 'init':
            master.init(e.data);
            break;
        case 'rpc':
            master.rpc(e.data)
            break;
        case 'setAggregatedValues':
            master.setAggregatedValues(e.data);
            break;
        case 'createDescendants':
            // worker.createDescendants(e.data.payload);
            break;
        case 'importAgents':
            // worker.importAgents(e.data.payload);
            break;
    }
}