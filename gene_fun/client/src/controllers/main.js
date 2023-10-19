import { MapRenderer } from "../renderers/MapRenderer.js";
import { AgentDetailsRenderer } from "../renderers/AgentDetailsRenderer.js";
import { Vector } from "../scope/Vector.js";
import { Board } from "../scope/Board.js";
import { neuronPool } from "../scope/neurons/neuronPool.js";
import { EventBus } from "../EventBus.js";
import { FileWriter } from "../FileWriter.js";
import { config } from "../scope/config.js";


import "../Components/controls/Controls.js"
import "../Components/import/Import.js"
import "../Components/stats/Stats.js"


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
const STATUS_PAUSED = 0;
const STATUS_RUNNING = 1;
const STATUS_INITIALIZED = 2;

const methodEventsMap = {
    neuronCreated: 'handleNeuronCreated',
    agentCreated: 'agentCreated',
    ready: 'handleWorkerReady',
    computed: 'handleComputed',
    armageddon: 'handleArmageddon',
    agentClick: 'agentClickHandler',
    computeRequest: 'computeRequest',
    rpcResponse: 'rpcResponse',
    create: 'createHandler',
    play: 'playHandler',
    kill: 'killHandler',
    pause: 'pauseHandler',
    save: 'saveHandler',
    importAgents: 'importAgents'
}


class Page {
    actions = 2000;
    populationSize = 1000;
    geneNumber = 30;
    survivabilityThreshold = 60;
    level = 0;

    map;

    controlsView;
    statsView;
    mapRenderer;
    detailsRenderer;

    neuronTypes;
    population;
    initialMapData;
    status = STATUS_INITIALIZED;
    armageddonStats = {};
    rpcCallbacks = new Map();

    bestPopulation = [];

    constructor(config){
        this.config = config;
        Object.keys(methodEventsMap).forEach(messageType => {
            EventBus.subscribe(messageType, this[methodEventsMap[messageType]].bind(this));
        });
        this.update = this.update.bind(this);
        this.neuronTypes = {};
        this.population = [];

        this.controlsView = document.querySelector("controls-view");
        this.statsView = document.querySelector('stats-view');


        this.controlsView.setAttribute('actions', `${this.actions}`);
        this.controlsView.setAttribute('gene-number', `${this.geneNumber}`);
        this.controlsView.setAttribute('survivability-threshold', `${this.survivabilityThreshold}`);



        EventBus.subscribe('paramChange', e => {
            if(typeof this[e.name] !== 'undefined'){
                this[e.name] = e.value;
            }
            if(e.name === 'geneNumber' || e.name === 'actions'){
                this.sendRpc(
                    [],
                    `set${e.name.slice(0,1).toUpperCase()}${e.name.slice(1)}`,
                    [e.value]
                )
            }
        });
    }

    createMap() {
        this.map = new Board(
            this.config.size,
            this.config.levels,
            this.level
        )
        this.map.population = [];
        this.population = [];
        this.initialMapData = this.map.toJSON();
    }

    killHandler(){
        this.status = STATUS_PAUSED;
        this.stopRendering();
        this.neuronTypes = {};
        this.population = [];
        this.map = null;
    }

    playHandler(){
        startMark = performance.mark('aaa');
        this.status = STATUS_RUNNING;
        this.updateWorker.postMessage({
            type: 'setAggregatedValues',
            payload: this.map.toJSON()
        });
    }

    pauseHandler(){
        this.status = STATUS_PAUSED;
    }

    createHandler(){
        this.createMap();
        this.status = STATUS_INITIALIZED;
        this.updateWorker = new Worker(
            'src/engine/WorkerMaster.js',
            {
                name: 'MasterWorker',
                type: 'module'
            }
        );
        this.updateWorker.addEventListener('message', this.update);
        this.updateWorker.postMessage({
            type: 'init',
            payload: {
                dependencies: [
                    '../scope/neurons/ScopeNeuron.js',
                    '../scope/neurons/VisionNeuron.js',
                ],
                neurons: neuronPool(this.map),
                populationSize: this.populationSize,
                geneNumber: this.geneNumber,
                minActions: this.actions,
                config: this.config.engineConfig
            }
        });
    }

    saveHandler(type){
        const population = type === 'best' ?  this.bestPopulation : this.map?.population;
        const filename = type === 'best' ?  'bestPopulation' : 'currentPopulation';
        if(!population?.length){
            console.error('Not enough data');
            return;
        }
        const writer = new FileWriter()
        writer.download(JSON.stringify(population), `${filename}.json`);
    }

    handleWorkerReady(){
        this.map.setPopulation(this.population);

        this.updateStats();

        this.map.placeAgentsOnMap();
        if (this.status === STATUS_RUNNING) {
            this.playHandler();
            this.renderAgentDetails();
            return;
        }
        if(this.status === STATUS_INITIALIZED){
            this.startRendering();
            this.sendRpc([], 'setAgentsActionValues', [this.map.toJSON().agents], () => {
                console.log('Agents set on map');
            })
        }
    }

    agentClickHandler({ agent }){
        this.renderAgentDetails(agent);
    }

    sendNeuronContext(type, msgId){
        this.sendRpc(['neuronPool', type], 'setContext', [this.initialMapData], null, msgId);
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
            this.rpcCallbacks.set(id, callback || (() => {}));
        } catch (e) {
            console.error(e);
        }
        return id;
    }

    handleNeuronCreated(e) {
        const neuron = e.data.payload;
        this.neuronTypes[neuron.id] = {...neuron};
        this.sendNeuronContext(neuron.type, e.data.msgId);
    }

    handleComputed(e){
        const computeResults = e.data.payload;
        if(this.selectedAgent.id){
            setTimeout(() => {
                this.detailsRenderer.update(computeResults[this.selectedAgent.id])
            });
        }
        const results = Object.values(computeResults).map(entry => {
            const actionResult = this.actionAggregator(entry.results, entry.agent, this.neuronTypes);
            actionResult.reward = this.getActionReward(actionResult);
            return actionResult;
        });
        this.map.setPopulation(results);
        if(this.status === STATUS_RUNNING){
            this.updateWorker.postMessage({
                type: 'setAggregatedValues',
                payload: this.map.toJSON()
            })
        }
    }

    handleArmageddon(){
        this.population = [];
        const [replicators, agentsPerArea] = this.map.findAllAgents();
        const survivability = Math.round((replicators.length / this.map.population.length) * 10000) / 100;
        if(survivability > this.armageddonStats.survivability){
            this.bestPopulation = this.map.population;
        }
        this.armageddonStats = {
            agentsPerArea,
            replicatorsNr: replicators.length,
            populationSize: this.map.population.length,
            survivability,
            maxSurvivability: Math.max(this.armageddonStats?.maxSurvivability || 0, survivability)
        };
        if (survivability > this.survivabilityThreshold){
            try {
                this.levelUp();
            } catch (e) {
                alert('Great success!!');
                return;
            }
        }
        this.map.population = [];
        endMark = performance.mark('aaa');
        console.log(endMark.startTime - startMark.startTime);
        this.updateWorker.postMessage({
            type: 'createDescendants',
            payload: JSON.parse(JSON.stringify(replicators))
        })
    }

    levelUp(){
        this.map.nextLevel();
        this.initialMapData = this.map.toJSON();
        Object.keys(this.neuronTypes).forEach(id => {
            this.sendNeuronContext(this.neuronTypes[id].type);
        });
        this.mapRenderer.clear();
        this.mapRenderer.render();
    }

    updateStats() {
        this.statsView.stats = [
            {
                label: 'Current population',
                value: this.map.population.length
            },
            {
                label: 'Old population size',
                value: this.armageddonStats?.populationSize
            },
            {
                label: 'Parents',
                value: this.armageddonStats?.replicatorsNr
            },
            {
                label: 'Survivability',
                value: this.armageddonStats?.survivability
            },
            {
                label: 'Max. survivability',
                value: this.armageddonStats?.maxSurvivability
            }
        ]
    }

    startRendering = () => {
        this.detailsRenderer = this.detailsRenderer || new AgentDetailsRenderer(document.getElementById('controls'), this.map, this.neuronTypes);
        this.mapRenderer = this.mapRenderer || new MapRenderer(this.map);
        this.updateStats();
        this.mapRenderer.render();
        this.renderAgentDetails();
    }

    renderAgentDetails(agent){
        this.selectedAgent = agent || [...this.map.population][~~(Math.random() * this.map.population.length - 1)];
        this.detailsRenderer.render(this.selectedAgent);
        EventBus.publish('selectedAgent', this.selectedAgent);
    }

    stopRendering(){
        EventBus.publish('stopRender');
        this.mapRenderer = null;
        this.detailsRenderer = null;
        this.statsRenderer = null;
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
        const currentActionVector = new Vector(currentActionValue.actionValue, Object.values(this.map.size).map(el => el - Board.agentSize));
        const deltaVectorX = new Vector([Math.abs(delta[0]), 0], Object.values(this.map.size));
        const deltaVectorY = new Vector([0, Math.abs(delta[1])], Object.values(this.map.size));
        let actionValue = currentActionVector[delta[0] < 0 ? 'subtract' : 'add'](deltaVectorX);
        actionValue = actionValue[delta[1] < 0 ? 'subtract' : 'add'](deltaVectorY);
        if(this.map.canReach(currentActionVector, actionValue)){
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
        return Math.max(...this.map.breedingAreas.map(area => {
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

    computeRequest(agent) {
        this.sendRpc([], 'testRunNeurons', [agent.id], response => {
            const actionResult = this.actionAggregator(
                response,
                {
                    ...agent,
                    actionValue: [...agent.actionValue],
                    oldActionValue: [...agent.oldActionValue]
                },
                this.neuronTypes
            );
            actionResult.reward = this.getActionReward(actionResult);
            console.log(actionResult.reward)
            this.map.population.forEach(agent => {
                if (agent.id === actionResult.id) {
                    agent.actionValue = actionResult.actionValue;
                    agent.oldActionValue = actionResult.oldActionValue;
                }
            });

            this.detailsRenderer.update({
                results: response,
                agent: actionResult
            })
        });
    }

    agentCreated(e){
        this.population.push(e.data.payload);
    }

    rpcResponse(e) {
        if (this.rpcCallbacks.has(e.data.payload.rpcId)) {
            this.rpcCallbacks.get(e.data.payload.rpcId)(e.data.payload.response);
        }
    }

    importAgents(agents){
        if(!this.map){
            this.createHandler();
        }
        const readyCallback = () => {
            this.stopRendering();
            unsubscribe();
            this.map.population = [];
            this.population = [];
            this.updateWorker.postMessage({
                type: 'importAgents',
                payload: agents
            });
            this.controlsView.setReadyState();
        };
        const unsubscribe = EventBus.subscribe('ready', readyCallback);
    }

    update(e){
        EventBus.publish(e.data?.type || e.type, e);
    }
}
const page = new Page(config);

export {
    page
}
