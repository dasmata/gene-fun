import { Vector } from "../scope/Vector.js";
import { Board } from "../scope/Board.js";
import { neuronPool } from "../scope/neurons/neuronPool.js";
import { FileWriter } from "../FileWriter.js";


const STATUS_PAUSED = 0;
const STATUS_RUNNING = 1;
const STATUS_INITIALIZED = 2;

let startMark = null
let endMark = null;
const lastLevelNeurons = {
    mr : () => [Board.agentSize, 0],
    ml: () => [-1 * Board.agentSize, 0],
    mu: () => [0, -1 * Board.agentSize],
    md: () => [0, Board.agentSize],
    mrand: () => [
        Math.round(Math.random()) * Board.agentSize * (Math.round(Math.random()) === 0 ? 1 : -1),
        Math.round(Math.random()) * Board.agentSize * (Math.round(Math.random()) === 0 ? 1 : -1)
    ]
};

const methodEventsMap = {
    neuronCreated: '_handleNeuronCreated',
    agentCreated: '_agentCreated',
    ready: '_handleWorkerReady',
    computed: '_handleComputed',
    armageddon: '_handleArmageddon',
    rpcResponse: '_rpcResponse'
}

class BoardService {
    _actions = 2000;
    _populationSize = 1000;
    _geneNumber = 30;
    _survivabilityThreshold = 60;
    _level = 0;
    _generationNr = 0;

    _board;

    _neuronTypes;
    _population;
    _initialMapData;
    _status = STATUS_INITIALIZED;
    _armageddonStats = {};
    _rpcCallbacks = new Map();
    _bestPopulation = [];

    _eventBusService;

    constructor(eventBusService) {
        this._eventBusService = eventBusService;
        Object.keys(methodEventsMap).forEach(messageType => {
            this._eventBusService.subscribe(messageType, this[methodEventsMap[messageType]].bind(this));
        });
        this._update = this._update.bind(this);
        this._neuronTypes = {};
        this._population = [];
    }

    changeParam(name, value) {
        const key = `_${name}`;
        if(typeof this[key] !== 'undefined'){
            this[key] = value;
        }
        if(name === 'geneNumber' || name === 'actions'){
            this.sendRpc(
                [],
                `set${name.slice(0,1).toUpperCase()}${name.slice(1)}`,
                [value]
            )
        }
    }

    createMap() {
        this._board = new Board(
            this.config.size,
            this.config.levels,
            this._level,
            this._eventBusService
        )
        this._board.setPopulation([]);
        this._population = [];
        this._initialMapData = this._board.toJSON();
    }


    kill(){
        this._status = STATUS_PAUSED;
        this._neuronTypes = {};
        this._population = [];
        this._board = null;
        this.updateWorker?.terminate();
        this.updateWorker = null;
    }

    play(){
        startMark = performance.mark('aaa');
        this._status = STATUS_RUNNING;
        this.updateWorker.postMessage({
            type: 'setAggregatedValues',
            payload: this._board.toJSON()
        });
    }

    pause(){
        this._status = STATUS_PAUSED;
    }

    async create(){
        return new Promise((resolve) => {
            this.createMap();
            this._status = STATUS_INITIALIZED;
            this.updateWorker = new Worker(
                'src/engine/WorkerMaster.js',
                {
                    name: 'MasterWorker',
                    type: 'module'
                }
            );
            this.updateWorker.addEventListener('message', this._update);
            const readyListener = (e) => {
                if (e.data.type === 'ready') {
                    this.updateWorker.removeEventListener('message', readyListener);
                    resolve(this._board);
                }

            }
            this.updateWorker.addEventListener('message', readyListener);

            this.updateWorker.postMessage({
                type: 'init',
                payload: {
                    dependencies: [
                        '../scope/neurons/ScopeNeuron.js',
                        '../scope/neurons/VisionNeuron.js',
                    ],
                    neurons: neuronPool(this._board),
                    populationSize: this._populationSize,
                    geneNumber: this._geneNumber,
                    minActions: this._actions,
                    config: this.config.engineConfig
                }
            });
        })
    }

    save() {
        const population = type === 'best' ?  this._bestPopulation : this._board?.population;
        const filename = type === 'best' ?  'bestPopulation' : 'currentPopulation';
        if(!population?.length){
            console.error('Not enough data');
            return;
        }
        const writer = new FileWriter()
        writer.download(JSON.stringify(population), `${filename}.json`);
    }

    _handleWorkerReady(){
        this._board.setPopulation(this._population);

        this._board.placeAgentsOnMap();
        this.selectAgent();

        this._armageddonStats.currentPopulationSize = this._board.population.length;
        this._eventBusService.publish('armageddonStats', this._armageddonStats);

        if (this._status === STATUS_RUNNING) {
            this._eventBusService.publish('savePopulation', {
                board: this._board.toJSON(),
                armageddonStats: this._armageddonStats,
                actions: this._actions,
                geneNumber: this._geneNumber,
                neurons: this._neuronTypes,
                level: this._level,
                survivabilityThreshold: this._survivabilityThreshold,
                generations: this._armageddonStats.generationNr
            });
            this.play();
            return;
        }
        if(this._status === STATUS_INITIALIZED){
            this.sendRpc([], 'setAgentsActionValues', [this._board.toJSON().agents], () => {
                console.log('Agents set on map');
            })
        }
    }

    selectAgent(agent){
        this._selectedAgent = agent || [...this._board.population][~~(Math.random() * this._board.population.length - 1)];
        this._eventBusService.publish('selectedAgent', {
            agent: this._selectedAgent,
            neurons: this._neuronTypes
        });
    }

    sendNeuronContext(type, msgId){
        this.sendRpc(['neuronPool', type], 'setContext', [this._initialMapData], null, msgId);
    }

    sendRpc(path, method, params, callback, threadIdentifier) {
        const id = `${Math.random().toString(36).substring(2,7)}-${Math.random().toString(36).substring(2,7)}-${Math.random().toString(36).substring(2,7)}`;
        try {
            this.updateWorker?.postMessage({
                type: 'rpc',
                payload: {
                    ctxPath: path,
                    method: method,
                    params: params,
                    rpcId: id
                },
                reqId: threadIdentifier
            })
            this._rpcCallbacks.set(id, callback || (() => {}));
        } catch (e) {
            console.error(e);
        }
        return id;
    }

    _handleNeuronCreated(e) {
        const neuron = e.data.payload;
        this._neuronTypes[neuron.id] = {...neuron};
        this.sendNeuronContext(neuron.type, e.data.msgId);
    }


    _handleComputed(e){
        const computeResults = e.data.payload;

        if(this._selectedAgent.id){
            this._eventBusService.publish('selectedAgentUpdate', {
                agent: computeResults[this._selectedAgent.id].agent,
                results: computeResults[this._selectedAgent.id].results
            });
        }
        const results = Object.values(computeResults).map(entry => {
            const actionResult = this.actionAggregator(entry.results, entry.agent, this._neuronTypes);
            actionResult.reward = this.getActionReward(actionResult);
            return actionResult;
        });
        this._board.setPopulation(results);
        if(this._status === STATUS_RUNNING){
            this.updateWorker.postMessage({
                type: 'setAggregatedValues',
                payload: this._board.toJSON()
            })
        }
    }

    _handleArmageddon(){
        this._population = [];
        this._selectedAgent = null;
        const [replicators, agentsPerArea] = this._board.findAllAgents();
        const survivability = Math.round((replicators.length / this._board.population.length) * 10000) / 100;
        if(survivability > this._armageddonStats.survivability){
            this._bestPopulation = this._board.population;
        }
        this._generationNr++;
        this._armageddonStats = {
            agentsPerArea,
            generationNr: this._generationNr,
            replicatorsNr: replicators.length,
            oldPopulationSize: this._board.population.length,
            currentPopulationSize: this._board.population.length,
            survivability,
            maxSurvivability: Math.max(this._armageddonStats?.maxSurvivability || 0, survivability)
        };
        if (survivability > this.survivabilityThreshold){
            try {
                this.levelUp();
            } catch (e) {
                alert('Great success!!');
                return;
            }
        }
        this._board.setPopulation([]);
        endMark = performance.mark('aaa');
        console.log(endMark.startTime - startMark.startTime);
        this.updateWorker.postMessage({
            type: 'createDescendants',
            payload: JSON.parse(JSON.stringify(replicators))
        })
    }

    levelUp(){
        this._board.nextLevel();
        this._initialMapData = this._board.toJSON();
        Object.keys(this._neuronTypes).forEach(id => {
            this.sendNeuronContext(this._neuronTypes[id].type);
        });
        this._mapRenderer.clear();
        this._mapRenderer.render();
    }

    actionAggregator(results, currentActionValue, neuronTypes) {
        const delta = [0, 0];
        Object.keys(results).forEach(id => {
            if (Object.keys(lastLevelNeurons).includes(neuronTypes[id].type)) {
                if(results[id].val === 1){
                    lastLevelNeurons[neuronTypes[id].type]().forEach((el, idx) => {
                        delta[idx] += el;
                    });
                }
            }
        })
        const currentActionVector = new Vector(currentActionValue.actionValue, Object.values(this._board.size).map(el => el - Board.agentSize));
        const deltaVectorX = new Vector([Math.abs(delta[0]), 0], Object.values(this._board.size));
        const deltaVectorY = new Vector([0, Math.abs(delta[1])], Object.values(this._board.size));
        let actionValue = currentActionVector[delta[0] < 0 ? 'subtract' : 'add'](deltaVectorX);
        actionValue = actionValue[delta[1] < 0 ? 'subtract' : 'add'](deltaVectorY);
        if(this._board.canReach(currentActionVector, actionValue)){
            currentActionValue.oldActionValue = currentActionValue.actionValue;
            currentActionValue.actionValue = actionValue.toJSON();
        } else {
            currentActionValue.oldActionValue = currentActionValue.actionValue;
        }
        return currentActionValue;

    }

    getActionReward(agent) {
        if((
            agent.actionValue[0] === agent.oldActionValue[0] && agent.actionValue[0] === agent.oldActionValue[0])
        ) {
            return Math.round(Math.random() * 10) * (Math.round(Math.random()) === 0 ? 1 : -1);
        }
        return Math.max(...this._board.breedingAreas.map(area => {
            const middle = [...area[1].subtract(area[0])].map((el, idx) => ((el / 2) + area[0][idx]));
            const distance = [
                Math.abs(agent.actionValue[0] - middle[0]),
                Math.abs(agent.actionValue[1] - middle[1])
            ];
            const oldDistance = [
                Math.abs(agent.oldActionValue[0] - middle[0]),
                Math.abs(agent.oldActionValue[1] - middle[1])
            ];

            return (
                distance[0] > oldDistance[0]
                    ? -1
                    : (distance[0] < oldDistance[0]
                            ? 1
                            : 0
                    )
            ) + (
                distance[1] > oldDistance[1]
                    ? -1
                    : (distance[1] < oldDistance[1]
                            ? 1
                            : 0
                    )
            );
        }))
    }

    async requestCompute(agent){
        return new Promise((resolve, reject) => {
            this.sendRpc([], 'testRunNeurons', [agent.id], response => {
                const actionResult = this.actionAggregator(
                    response,
                    {
                        ...agent,
                        actionValue: [...agent.actionValue],
                        oldActionValue: [...agent.oldActionValue]
                    },
                    this._neuronTypes
                );
                actionResult.reward = this.getActionReward(actionResult);
                this._board.population.forEach(agent => {
                    if (agent.id === actionResult.id) {
                        agent.actionValue = actionResult.actionValue;
                        agent.oldActionValue = actionResult.oldActionValue;
                    }
                });
                resolve({
                    results: response,
                    agent: actionResult
                })
            });
        });

    }

    _agentCreated(e){
        this._population.push(e.data.payload);
    }

    _rpcResponse(e) {
        if (this._rpcCallbacks.has(e.data.payload.rpcId)) {
            this._rpcCallbacks.get(e.data.payload.rpcId)(e.data.payload.response);
        }
    }

    async importAgents(agents) {
        let result;
        if(!this._board){
            result = await this.create();
        }
        this._board.setPopulation([]);
        this._population = [];
        this.updateWorker.postMessage({
            type: 'importAgents',
            payload: agents
        });
        return result;
    }

    _update(e){
        this._eventBusService.publish(e.data?.type || e.type, e);
    }

    setConfig(config){
        this.config = config;
        this._actions = config.actions || this._actions;
        this._level = config.level || this._level;
        this._survivabilityThreshold = config.minSurvivability || this._survivabilityThreshold;
        this._geneNumber = config.geneNumber || this._geneNumber;
        this._generationNr = config.generationNr || this._generationNr;
        this._armageddonStats.generationNr = this._generationNr;
    }

    get actions() {
        return this._actions;
    }

    get geneNumber() {
        return this._geneNumber;
    }

    get survivabilityThreshold() {
        return this._survivabilityThreshold;
    }
}

export {
    BoardService as Board
}