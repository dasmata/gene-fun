class AgentDetailsRenderer {
    currentDetails = null
    wrapper = null;
    agentTemplate = null;
    resultsElCache = [];
    world = null;
    brainComputeObserver = null;
    agentDieObserver = null;
    lvlTpl = null;
    clearHandler = null;
    computeClickHandler = null;

    constructor(wrapper, world) {
        this.wrapper = wrapper;
        this.world = world;
        this.agentTemplate = document.getElementById('agent');
        this.lvlTpl = document.getElementById('level');
        this.brainComputeObserver = {
            update: this.brainComputeHandler.bind(this)
        };
        this.agentDieObserver = {
            update: () => this.agentDieHandler.bind(this)
        }

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

    brainComputeHandler(e){
        if(e.type !== 'compute') {
            return;
        }
        const {brain, results} = e.payload;
        brain.levels[brain.levels.length - 1].forEach((node, idx) => {
            this.resultsElCache[idx].textContent = '' + (results?.[node.id]?.val || 0);
            this.renderNeuronConnections(brain.agent);
        })
    }

    agentDieHandler(e) {
        if(e.type !== 'die'){
            return;
        }
        e.payload.brain.attach(this.brainComputeObserver);
        e.payload.detach(this.agentDieObserver);
    }

    computeClickHandleGenerator(agent) {
        return (e) => {
            const results = agent.brain.compute();
            agent.brain.evaluate(results);
        }
    }

    render(agent) {
        if(!agent){
            return;
        }
        this.destroyDetails();
        this.clearHandler = this.clearHandlerGenerator(agent);
        this.computeClickHandler = this.computeClickHandleGenerator(agent);
        this.currentDetails = this.agentTemplate.content.cloneNode(true).querySelector('#details-container');

        this.currentDetails.querySelector('h2').textContent = Symbol.keyFor(agent.id);
        this.currentDetails.querySelector('button.clear').addEventListener('click', this.clearHandler)
        this.currentDetails.querySelector('button.compute').addEventListener('click', this.computeClickHandler)

        this.renderNeuronLevels(agent);
        this.wrapper.appendChild(this.currentDetails)
        this.renderNeuronConnections(agent)
        this.renderResultsElements(agent);

        agent.brain.attach(this.brainComputeObserver)
        agent.attach(this.agentDieObserver)
    }

    renderResultsElements(agent) {
        const resultsTplEl = this.lvlTpl.content.cloneNode(true);
        const resultsEl = resultsTplEl.querySelector('.level');
        resultsEl.querySelector('h4').textContent = `Results`;

        const listEl = resultsTplEl.querySelector('.level-neurons');
        this.resultsElCache = [];
        agent.brain.levels[agent.brain.levels.length - 1].forEach(node => {
            const resultEl = document.createElement('div');
            resultEl.classList.add('result')
            resultEl.setAttribute('id', `${node.id}_result`)
            this.resultsElCache.push(resultEl);
            listEl.appendChild(resultEl)
        })
        this.currentDetails.querySelector('.brain').appendChild(resultsTplEl);
    }

    renderNeuronConnections(agent){
        const svgEl = this.currentDetails.querySelectorAll(`.level-row svg`);
        svgEl?.forEach(svg => {
            const lines = svg.querySelectorAll('line');
            lines?.forEach(line => {
                svg.removeChild(line);
            })
        })


        agent.brain.levels.forEach((lvl, idx) => {
            lvl.forEach((neuron, nr) => {
                agent.brain.connections[neuron.id]?.forEach(conn => {
                    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
                    const source = this.currentDetails.querySelector(`#neuron_${neuron.id}`);
                    const dest = this.currentDetails.querySelector(`#neuron_${conn[0]}`);
                    const weight = Math.round(conn[1]);
                    line.setAttribute('x1', source.offsetLeft + 20);
                    line.setAttribute('y1', 0);
                    line.setAttribute('x2', dest.offsetLeft + 20);
                    line.setAttribute('y2', 40);
                    line.setAttribute('stroke', weight > 0 ? '#00ff00' : '#ff0000');
                    line.setAttribute('stroke-width', Math.round(4 / (5 / (weight + 5))));
                    svgEl[idx].appendChild(line);
                });
            });
        });
    }

    renderNeuronLevels(agent) {
        const brainWrapper = this.currentDetails.querySelector('.brain');
        const redFactor = ~~(255 / agent.brain.levels.length);

        agent.brain.levels.forEach((lvl, idx) => {
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
        neuronEl.textContent = Symbol.keyFor(neuron.type)
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