import { config } from "../scope/config.js";
import { Base } from "./Base.js";

import "../Components/controls/Controls.js";
import "../Components/import/Import.js";
import "../Components/stats/Stats.js";
import "../Components/agentDetails/AgendDetails.js";
import "../Components/board/Board.js";
import { FileWriter } from "../FileWriter.js";

class Page extends Base {
    _controlsView;
    _statsView;
    _boardView;
    _agentDetailsView;
    _importView;

    _training;
    _boardService;
    _eventBusService;

    _events = [
        { target: '_controlsView', name: 'create', handler: 'createHandler' },
        { target: '_controlsView', name: 'play', handler: 'playHandler' },
        { target: '_controlsView', name: 'pause', handler: 'pauseHandler' },
        { target: '_controlsView', name: 'kill', handler: 'killHandler' },
        { target: '_controlsView', name: 'paramChange', handler: 'paramsChangeHandler' },

        { target: '_agentDetailsView', name: 'computeRequest', handler: 'computeRequestHandler' },

        { target: '_boardView', name: 'agentSelect', handler: 'agentSelectHandler' },

        { target: '_importView', name: 'saveCurrent', handler: 'saveCurrentHandler' },
        { target: '_importView', name: 'saveBest', handler: 'saveBestHandler' },
        { target: '_importView', name: 'importAgents', handler: 'importAgentsHandler' },

        { target: 'eventBus', name: 'selectedAgent', handler: 'autoAgentSelectHandler' },
        { target: 'eventBus', name: 'selectedAgentUpdate', handler: 'autoAgentSelectHandler' }
    ]

    constructor(serviceContainer){
        super(serviceContainer);
        this._eventBusService = this._serviceContainer.get('eventBus')
            .then(srv => this._eventBusService = srv);

    }

    async init() {
        this._training = window.history.state?.training;
        this._boardService = await this._serviceContainer.get('board');
        let population;

        if (this._training) {
            const service = await this._serviceContainer.get('population')
            population = await service.getAll(1, {
                filters: {training: this._training.id},
                perPage: 1
            });
            if (population.length) {
                config.actions = population[0].actions;
                config.level = population[0].level;
                config.minSurvivability = population[0].min_survivability;
                config.neurons = population[0].neurons;
                config.generationNr = population[0].generations;
                config.geneNumber = population[0].gene_number;
            }
        }
        this.initBoard(config)
        if (population.length) {
            this._controlsView.setAttribute('actions', config.actions);
            this._controlsView.setAttribute('level', config.level);
            this._controlsView.setAttribute('gene-number', config.geneNumber);
            this._controlsView.setAttribute('survivability-threshold', config.minSurvivability);
            this._controlsView.setReadyState();

            await this.importAgents(population[0].agents)
        }
    }

    initBoard(config) {
        this._controlsView = document.querySelector("controls-view");
        this._statsView = document.querySelector('stats-view');
        this._agentDetailsView = document.querySelector('agent-details-view');
        this._boardView = document.querySelector('board-view');
        this._importView = document.querySelector('import-view');

        this._controlsView.setAttribute('actions', `${this._boardService.actions}`);
        this._controlsView.setAttribute('gene-number', `${this._boardService.geneNumber}`);
        this._controlsView.setAttribute('survivability-threshold', `${this._boardService.survivabilityThreshold}`);

        this._boardService.setConfig(config);

        this._events.forEach((event, idx) => {
            this[event.handler] = this[event.handler].bind(this);
            if (event.target === 'eventBus'){
                this._events[idx] = this._eventBusService.subscribe(event.name, this[event.handler]);
            } else {
                this[event.target].addEventListener(event.name, this[event.handler]);
            }
        });
        this._events.push(this._eventBusService.subscribe('savePopulation', this._savePopulationHandler.bind(this)));
        this._events.push(this._eventBusService.subscribe('armageddonStats', this._armageddonStatsHandler.bind(this)));

        this.hideLoader();
    }

    destroy() {
        this._events.forEach(event => {
            if (typeof event === 'function') {
                event();
                return;
            }
            this[event.target].removeEventListener(event.name, this[event.handler]);
        });
    }

    _savePopulationHandler(e){
        this._serviceContainer.get('population').then(srv => {
            srv.save({
                training: this._training.id,
                agents: Object.values(e.board.agents),
                gene_number: e.geneNumber,
                neurons: Object.values(e.neurons).reduce((acc, neuron) => {
                    acc[neuron.level] = acc[neuron.level] || [];
                    acc[neuron.level].push(neuron.type);
                    return acc;
                }, []),
                actions: parseInt(e.actions),
                level: e.level,
                min_survivability: e.survivabilityThreshold,
                survivability: e.armageddonStats.survivability,
                best_survivability: e.armageddonStats.maxSurvivability,
                generations: e.armageddonStats.generationNr
            })
        });
    }

    _armageddonStatsHandler(stats) {
        this._statsView.stats = [
            {
                label: 'Generation nr',
                value: stats.generationNr
            },
            {
                label: 'Current population',
                value: stats.currentPopulationSize
            },
            {
                label: 'Old population size',
                value: stats.oldPopulationSize
            },
            {
                label: 'Parents',
                value: stats.replicatorsNr
            },
            {
                label: 'Survivability',
                value: stats.survivability
            },
            {
                label: 'Max. survivability',
                value: stats.maxSurvivability
            }
        ]
    }

    killHandler(){
        this._boardService.kill();
        this.stopRendering();
    }

    playHandler(){
        this._boardService.play();
    }

    pauseHandler(){
        this._boardService.pause();
    }

    paramsChangeHandler(e) {
        this._boardService.changeParam(e.detail.name, e.detail.value)
    }

    async createHandler(){
        this.showLoader();
        const board = await this._boardService.create();
        this.startRendering(board);
        this.hideLoader();
    }

    autoAgentSelectHandler(data) {
        setTimeout(() => {
            this.renderAgentDetails(data);
        })
    }

    agentSelectHandler(e){
        this._boardService.selectAgent(e.detail.agent);
    }

    startRendering(board) {
        this._boardView.board = board;
    }

    stopRendering() {
        this._boardView.board = null;
        this._statsView.stats = null;
        this._agentDetailsView.agent = null;
    }

    renderAgentDetails({ agent, neurons, results }){
        if (neurons){
            this._agentDetailsView.neurons = neurons;
        }
        this._agentDetailsView.agent = agent;
        this._boardView.activeAgent = agent;
        if (results) {
            this._agentDetailsView.results = results;
        }
    }

    async computeRequestHandler(e) {
        const agent = e.detail;
        const response = await this._boardService.requestCompute(agent)
        this.renderAgentDetails(response);
    }

    saveCurrentHandler(e) {
        this.save('current')
    }

    saveBestHandler(e) {
        this.save('best')
    }

    importAgentsHandler(e) {
        this.importAgents(e.detail);
    }


    save(type) {
        const population = type === 'best' ?  this._boardService.bestPopulation : this._boardService.population;
        const filename = type === 'best' ?  'bestPopulation' : 'currentPopulation';
        if(!population?.length){
            console.error('Not enough data');
            return;
        }
        const writer = new FileWriter()
        writer.download(JSON.stringify(population), `${filename}.json`);
    }

    async importAgents(agents){
        this.showLoader();
        this.stopRendering();
        const board = await this._boardService.importAgents(agents)
        this.startRendering(board);
        this.hideLoader();
    }
}

Page.layout = 'main';
Page.partial = 'board';

export {
    Page as Board
}
