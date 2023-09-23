class AgentDetailsRenderer {
    currentDetails = null
    wrapper = null;
    agentTemplate = null;
    resultsElCache = [];
    world = null;
    armageddonObserver = null;
    brainComputeObserver = null;
    lvlTpl = null;
    clearHandler = null;
    computeClickHandler = null;

    constructor(wrapper, world) {
        this.wrapper = wrapper;
        this.world = world;
        this.agentTemplate = document.getElementById('agent');
        this.lvlTpl = document.getElementById('level');
        this.armageddonObserver = {
            update: this.armageddonHandler.bind(this)
        };
        this.brainComputeObserver = {
            update: this.brainComputeHandler.bind(this)
        };
    }

    destroyDetails() {
        if (this.currentDetails) {
            this.wrapper.removeChild(this.currentDetails);
            this.currentDetails = null;
        }
    }

    armageddonHandler(e) {
        if(e.type === 'armageddon'){
            this.clearHandler();
        }
    }

    clearHandlerGenerator(agent) {
        return () => {
            this.currentDetails.querySelector('button.clear').removeEventListener('click', this.clearHandler);
            this.currentDetails.querySelector('button.compute').removeEventListener('click', this.computeClickHandler);
            this.wrapper.removeChild(this.currentDetails);
            this.world.detach(this.armageddonObserver);
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
            // if(results?.[node.id]?.val && results?.[node.id]?.val !== 0){
            //     return;
            // }
            // console.log(results?.[node.id].val, results[node.id]?.val, this.resultsElCache[idx]);

            this.resultsElCache[idx].textContent = '' + (results?.[node.id]?.val || 0)
        })
    }

    computeClickHandleGenerator(agent) {
        return (e) => {
            console.log(JSON.parse(JSON.stringify(agent.brain.connections)));
            const results = agent.brain.compute();
            agent.brain.evaluate(results);
            console.log(JSON.parse(JSON.stringify(agent.brain.connections)));
        }
    }

    render(agent) {
        this.destroyDetails();
        this.clearHandler = this.clearHandlerGenerator(agent);
        this.computeClickHandler = this.computeClickHandleGenerator(agent);
        this.currentDetails = this.agentTemplate.content.cloneNode(true).querySelector('#details-container');
        this.world.attach(this.armageddonObserver);

        this.currentDetails.querySelector('h2').textContent = Symbol.keyFor(agent.id);
        this.currentDetails.querySelector('button.clear').addEventListener('click', this.clearHandler)
        this.currentDetails.querySelector('button.compute').addEventListener('click', this.computeClickHandler)

        this.renderNeuronLevels(agent);
        this.wrapper.appendChild(this.currentDetails)
        this.renderNeuronConnections(agent)
        this.renderResultsElements(agent);

        agent.brain.attach(this.brainComputeObserver)
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
            // resultEl.textContent = '0';
            this.resultsElCache.push(resultEl);
            listEl.appendChild(resultEl)
        })
        this.currentDetails.querySelector('.brain').appendChild(resultsTplEl);
    }

    renderNeuronConnections(agent){
        const svgEl = document.querySelectorAll(`.level-row svg`);
        agent.brain.levels.forEach((lvl, idx) => {
            lvl.forEach((neuron, nr) => {
                agent.brain.connections[neuron.id]?.forEach(conn => {
                    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
                    const source = document.getElementById(neuron.id);
                    const dest = document.getElementById(conn[0]);
                    line.setAttribute('x1', source.offsetLeft + 20);
                    line.setAttribute('y1', 0);
                    line.setAttribute('x2', dest.offsetLeft + 20);
                    line.setAttribute('y2', 40);
                    line.setAttribute('stroke', source.style.backgroundColor);
                    line.setAttribute('stroke-width', Math.round(conn[1]));
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
        })
    }

    renderNeuron(neuron, rgb){
        const neuronEl = document.createElement('div');
        neuronEl.classList.add('neuron')
        neuronEl.textContent = Symbol.keyFor(neuron.type)
        neuronEl.setAttribute('id', neuron.id)
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