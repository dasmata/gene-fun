import "./AgentNeuronLevel.js"
import "./AgentResults.js"
import { EventBus } from "../../EventBus.js";

class AgentDetails extends HTMLElement {

    _shadowRoot;
    _neuronLevels;
    _levelElements;
    _neuronOffsets;
    _resultsRow;
    _agent;


    constructor() {
        super();
        this._neuronLevels = [];
        this._levelElements = [];
        this._neuronOffsets = [];

        this.clearHandler = this.clearHandler.bind(this);
        this.computeHandler = this.computeHandler.bind(this);
    }

    connectedCallback() {
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
    }


    disconnectedCallback() {
        this._shadowRoot.querySelector('.clear').removeEventListener('click', this.clearHandler);
        this._shadowRoot.querySelector('.compute').removeEventListener('click', this.computeHandler);
    }

    clearHandler() {
        this._shadowRoot.innerHTML = '';
        this.disconnectedCallback();
    }

    computeHandler() {
        EventBus.publish('computeRequest', this._agent);
    }

    renderNeurons(){
        const brainWrapper = this._shadowRoot.querySelector('.brain');
        const redFactor = ~~(255 / this._neuronLevels.length);
        brainWrapper.innerHTML = '';

        this._neuronLevels.forEach((lvl, idx) => {
            const el = document.createElement('agent-neuron-level-view');
            const greenFactor = ~~(255 / lvl.length);
            el.setAttribute('level', idx);
            el.setAttribute('red-factor', `${redFactor}`);
            el.setAttribute('green-factor', `${greenFactor}`);
            el.neurons = lvl;
            this._levelElements[idx] = el;
            brainWrapper.appendChild(el);
            this._neuronOffsets[idx] = el.offsets;
        });
    }

    renderResultsElements() {
        const brainWrapper = this._shadowRoot.querySelector('.brain');
        const el = document.createElement('agent-results-view')
        el.results = this._neuronLevels.slice(-1)[0].map(node => ({
            id: node.id,
            result: ''
        }));
        this._resultsRow = el;
        brainWrapper.appendChild(el);
    }

    appendTemplate() {
        const titleEl = this._shadowRoot.querySelector('h2');
        if (titleEl) {
            return;
        }
        const template = document.getElementById('agent-tpl').content.cloneNode(true);
        this._shadowRoot.append(template)
        this.renderNeurons();
        this.renderResultsElements();
        this._shadowRoot.querySelector('.clear').addEventListener('click', this.clearHandler);
        this._shadowRoot.querySelector('.compute').addEventListener('click', this.computeHandler);
    }

    set neurons(data) {
        this._neuronLevels = Object.values(data).reduce((levels, neuron, idx) => {
            levels[neuron.level] = levels[neuron.level] || [];
            levels[neuron.level].push({ type: neuron.type, id: neuron.id});
            return levels;
        }, []);
        this.appendTemplate();
    }

    set agent(agent) {
        this.appendTemplate();
        agent.genes.data.reduce((acc, gene) => {
            acc[gene[2]] = acc[gene[2]] || [];
            acc[gene[2]].push(gene);
            return acc;
        }, []).forEach((genes, idx) => {
            this._levelElements[idx].connections = genes.map(gene => {
                return [
                    this._neuronOffsets[idx][gene[0]],
                    this._neuronOffsets[idx + 1][gene[1]],
                    gene[3]
                ]
            });
        });
        this._agent = agent;
        this._shadowRoot.querySelector('h2').textContent = agent.id;
    }

    set results(results){
        this._resultsRow.results = this._neuronLevels.slice(-1)[0].map(neuron => {
            return {
                id: neuron.id,
                result: results[neuron.type]?.val || 0
            };
        });
    }
}

customElements.define('agent-details-view', AgentDetails);