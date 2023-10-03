class AgentDetailsRenderer {
    currentDetails = null
    wrapper = null;
    agentTemplate = null;
    resultsElCache = [];
    map = null;
    brainComputeObserver = null;
    lvlTpl = null;
    clearHandler = null;
    computeClickHandler = null;
    neurons = {};
    neuronConnections = {};

    constructor(wrapper, map, neurons) {
        this.wrapper = wrapper;
        this.map = map;
        this.neurons = neurons;
        this.neuronLevels = Object.values(this.neurons).reduce((levels, neuron, idx) => {
            levels[neuron.level] = levels[neuron.level] || [];
            levels[neuron.level].push({ type: neuron.type, id: neuron.id});
            return levels;
        }, []);
        this.agentTemplate = document.getElementById('agent');
        this.lvlTpl = document.getElementById('level');
        EventBus.subscribe('stopRender', this.clear.bind(this));
    }

    clear() {
        this.destroyDetails();
    }

    destroyDetails() {
        if (this.currentDetails) {
            this.wrapper.removeChild(this.currentDetails);
            this.currentDetails = null;
        }
    }

    clearHandlerGenerator(agent) {
        return () => {
            if(!this.currentDetails){
                return;
            }
            this.currentDetails.querySelector('button.clear').removeEventListener('click', this.clearHandler);
            this.currentDetails.querySelector('button.compute').removeEventListener('click', this.computeClickHandler);
            this.wrapper.removeChild(this.currentDetails);
            this.currentDetails = null;
            this.resultsElCache = [];
            agent.brain.detach(this.brainComputeObserver);
        }
    }

    update(updateData){
        if(!updateData){
            return;
        }
        const {results, agent} = updateData;
        this.generateNeuronConnectionsFromGenes(agent.genes.data);
        this.neuronLevels.slice(-1)[0].forEach((node, idx) => {
            this.resultsElCache[idx].textContent = '' + (results?.[node.id]?.val || 0)
        })
        this.renderNeuronConnections()
    }

    computeClickHandleGenerator(agent) {
        return (e) => {
            EventBus.publish('computeRequest', agent);
        }
    }

    generateNeuronConnectionsFromGenes(genes) {
        this.neuronConnections = genes.reduce((connections, gene) => {
            const startLevel = gene[2];
            const arr = connections[this.neuronLevels[startLevel][gene[0]].id] || []
            arr.push([this.neuronLevels[startLevel + 1][gene[1]].id, (gene[3] + gene[4]) / 2]);
            connections[this.neuronLevels[startLevel][gene[0]].id] = arr;
            return connections;
        }, {});
    }

    render(agent) {
        if(!agent){
            return;
        }
        this.generateNeuronConnectionsFromGenes(agent.genes.data);

        this.destroyDetails();
        this.clearHandler = this.clearHandlerGenerator(agent);
        this.computeClickHandler = this.computeClickHandleGenerator(agent);
        this.currentDetails = this.agentTemplate.content.cloneNode(true).querySelector('#details-container');

        this.currentDetails.querySelector('h2').textContent = agent.id;
        this.currentDetails.querySelector('button.clear').addEventListener('click', this.clearHandler)
        this.currentDetails.querySelector('button.compute').addEventListener('click', this.computeClickHandler)

        this.renderNeuronLevels(agent);
        this.renderResultsElements(agent);
        this.wrapper.appendChild(this.currentDetails)

        this.renderNeuronConnections(agent)
    }

    renderResultsElements() {
        const resultsTplEl = this.lvlTpl.content.cloneNode(true);
        const resultsEl = resultsTplEl.querySelector('.level');
        resultsEl.querySelector('h4').textContent = `Results`;

        const listEl = resultsTplEl.querySelector('.level-neurons');
        this.resultsElCache = [];
        this.neuronLevels.slice(-1)[0].forEach(node => {
            const resultEl = document.createElement('div');
            resultEl.classList.add('result')
            resultEl.setAttribute('id', `${node.id}_result`)
            this.resultsElCache.push(resultEl);
            listEl.appendChild(resultEl)
        })
        this.currentDetails.querySelector('.brain').appendChild(resultsTplEl);
    }

    renderNeuronConnections(){
        if(!this.currentDetails){
            return;
        }
        const svgEl = this.currentDetails.querySelectorAll(`.level-row svg`);
        svgEl?.forEach(svg => {
            const lines = svg.querySelectorAll('line');
            lines?.forEach(line => {
                svg.removeChild(line);
            })
        })


        this.neuronLevels.forEach((lvl, idx) => {
            lvl.forEach((neuron, nr) => {
                this.neuronConnections[neuron.id]?.forEach(conn => {
                    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
                    const source = this.currentDetails.querySelector(`#neuron_${neuron.id}`);
                    const dest = this.currentDetails.querySelector(`#neuron_${conn[0]}`);
                    const weight = Math.round(conn[1]) + 2;
                    line.setAttribute('x1', source.offsetLeft + 20);
                    line.setAttribute('y1', 0);
                    line.setAttribute('x2', dest.offsetLeft + 20);
                    line.setAttribute('y2', 40);
                    line.setAttribute('stroke', weight > 4 ? '#00ff00' : '#ff0000');
                    line.setAttribute('stroke-width', weight / 2);
                    svgEl[idx].appendChild(line);
                });
            });
        });
    }

    renderNeuronLevels(agent) {
        const brainWrapper = this.currentDetails.querySelector('.brain');
        const redFactor = ~~(255 / this.neuronLevels.length);

        this.neuronLevels.forEach((lvl, idx) => {
            const lvlTplEl = this.lvlTpl.content.cloneNode(true);
            const element = lvlTplEl.querySelector('.level');
            element.querySelector('h4').textContent = `Level ${idx}`;

            const greenFactor = ~~(255 / lvl.length);
            const neuronsListNode = element.querySelector('.level-neurons');
            lvl.forEach((neuron, nr) => {
                neuronsListNode.appendChild(this.renderNeuron(neuron, [
                    redFactor * idx,
                    greenFactor * nr,
                    88
                ]))
            })
            brainWrapper.appendChild(lvlTplEl);
        });

    }

    renderNeuron(neuron, rgb){
        const neuronEl = document.createElement('div');
        neuronEl.classList.add('neuron')
        neuronEl.textContent = neuron.type
        neuronEl.setAttribute('id', `neuron_${neuron.id}`)
        const brightness = Math.round(((parseInt(rgb[0]) * 299) +
            (parseInt(rgb[1]) * 587) +
            (parseInt(rgb[2]) * 114)) / 1000);
        neuronEl.style.backgroundColor = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`
        if(brightness < 125){
            neuronEl.style.color = 'white';
        }
        return neuronEl;
    }
}