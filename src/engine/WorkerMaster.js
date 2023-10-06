importScripts(
    'WorkerMessageBus.js',
    'utils.js'
)

class WorkerMaster {
    workers;
    messageBus;
    clientMessages;
    unsubComputed;
    config;

    agentsIdx;

    constructor(){
        this.workers = [];
        this.agentsIdx = {};
        this.clientMessenger = this.clientMessengerFactory();
        this.clientMessages = {};
    }

    init({ payload }){
        const maxWorkers = ~~(navigator.hardwareConcurrency * payload.config.workers);
        const workersNum = payload.populationSize < maxWorkers ? payload.populationSize : maxWorkers;
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
        this.config = payload;
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
        let unsubAgentCreated;

        const unsubDescendantsCreated = this.messageBus.subscribe('descendantsCreated', e => {
            unsubDescendantsCreated();
            // last setAggregated is sent when the generation is dead so a computed listener remains hangging
            this.unsubComputed?.();
            unsubAgentCreated = this.messageBus.subscribe('agentCreated', (msg) => {
                this.agentsIdx[msg.data.payload.id] = this.workers.indexOf(msg.target);
                this.clientMessenger.send(msg.data);
            });
            const perWorker = Math.ceil(e.data.payload.length / this.workers.length);
            this.workers.forEach((worker, idx) => {
                importRequestId = this.messageBus.publish(
                    'importAgents',
                    { agents: e.data.payload.slice(idx * perWorker, (idx + 1) * perWorker) },
                    worker,
                    importRequestId
                )
            });
        });
        const unsubAllAgentsReady = this.messageBus.subscribe('ready', (data) => {
            unsubAllAgentsReady()
            unsubAgentCreated();
            this.clientMessenger.send({
                type: 'ready',
                payload: null
            });
        });

        this.messageBus.publish('createDescendants', {
            parents: payload,
            size: this.config.populationSize
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
        this.unsubComputed = this.messageBus.subscribe('computed', msg => {
            computedValues[this.workers.indexOf(msg.target)] = msg.data.payload
            if(computedValues.length === this.workers.length && !computedValues.includes(undefined)){
                this.unsubComputed?.();
                this.clientMessenger.send({
                    type: 'computed',
                    payload: Object.assign(...computedValues)
                });
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
        }

    }

    testRunNeurons(data){
        const agentId = data.payload.params[0];
        if(typeof this.agentsIdx[agentId] === 'undefined'){
            throw new Error('Agent was not found in the worker index');
        }
        const workerIdx = this.agentsIdx[agentId];
        const unsubResponse = this.messageBus.subscribe('rpcResponse', (data) => {
            unsubResponse();
            this.clientMessenger.send(data[workerIdx]);
        });
        this.messageBus.publish(data.type, data.payload, this.workers[this.agentsIdx[agentId]]);
    }

    rpc(data){
        if(data.reqId) {
            this.messageBus.publish(data.type, data.payload, this.clientMessages[data.reqId]?.initiator);
            delete this.clientMessages[data.reqId];
            return;
        }
        if(data.payload.ctxPath.length === 0){
            if(this[data.payload.method]){
                this[data.payload.method](data);
            } else {
                this.messageBus.publish(data.type, data.payload)
            }
        }
    }
}

const master = new WorkerMaster();