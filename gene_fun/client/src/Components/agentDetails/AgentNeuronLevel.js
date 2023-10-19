class AgentNeuronLevel extends HTMLElement {
    redFactor;
    greenFactor;
    level;

    _shadowRoot;
    _neurons;
    _neuronElements;

    static get observedAttributes() {
        return [
            'red-factor',
            'green-factor',
            'level'
        ]
    }

    constructor() {
        super();
        this.neurons = [];
        this._neuronElements = [];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        const propName = property.split('-').map((el, idx) => {
            if(idx === 0){
                return el;
            }
            return el.charAt(0).toUpperCase() + el.slice(1)
        }).join('')
        if(oldValue === newValue) {
            return;
        }
        this[propName] = newValue;
        this.renderNeurons();
    }

    connectedCallback() {
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        const template = document.getElementById('agent-neuron-level-tpl').content.cloneNode(true);

        this._shadowRoot.append(template)
        this.renderNeurons();
    }

    renderNeurons() {
        const neuronsListNode = this._shadowRoot?.querySelector('.level-neurons');
        if (!neuronsListNode) {
            return;
        }
        this._shadowRoot.querySelector('h4').innerText = `Level ${this.level}`;
        this._neurons.forEach((neuron, nr) => {
            const el = this.renderNeuron(neuron, [
                this.redFactor * this.level,
                this.greenFactor * nr,
                88
            ]);
            neuronsListNode.appendChild(el)
            this._neuronElements.push(el);
        })
    }

    renderNeuron(neuron, rgb) {
        const neuronEl = document.createElement('div');
        neuronEl.classList.add('neuron')
        neuronEl.textContent = neuron.type
        neuronEl.setAttribute('id', `neuron_${neuron.id}`)
        const brightness = Math.round(((parseInt(rgb[0]) * 299) +
            (parseInt(rgb[1]) * 587) +
            (parseInt(rgb[2]) * 114)) / 1000);
        neuronEl.style.backgroundColor = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`
        if (brightness < 125) {
            neuronEl.style.color = 'white';
        }
        return neuronEl;
    }

    get offsets() {
        return this._neuronElements.map(el => el.offsetLeft)
    }

    set neurons(data) {
        this._neurons = data;
        this.renderNeurons();
    }

    set connections(data){
        if(!this._shadowRoot){
            return;
        }
        const svgEl = this._shadowRoot.querySelector(`svg`);
        const lines = svgEl.querySelectorAll('line');
        lines?.forEach(line => {
            svgEl.removeChild(line);
        })
        data.forEach((conn, nr) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg','line');
            line.setAttribute('x1', conn[0] + 20);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', conn[1] + 20);
            line.setAttribute('y2', 40);
            line.setAttribute('stroke', conn[2] > 0 ? '#00ff00' : '#ff0000');
            line.setAttribute('stroke-width', (Math.abs(conn[2]) + 1) / 20);
            svgEl.appendChild(line);
        });
    }
}

customElements.define('agent-neuron-level-view', AgentNeuronLevel);