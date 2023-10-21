class AgentResults extends HTMLElement {

    _shadowRoot;
    _resultBoxes;

    constructor() {
        super();
        this._resultBoxes = {};
    }


    connectedCallback() {
        this._shadowRoot = this.attachShadow({mode: "closed"});
        const template = document.getElementById('agent-neuron-level-tpl').content.cloneNode(true);

        template.querySelector('h4').innerText = `Results`;
        this._shadowRoot.appendChild(template);
        this.renderResultBoxes();
    }

    renderResultBoxes() {
        const neuronsListNode = this._shadowRoot?.querySelector('.level-neurons');
        if (!neuronsListNode) {
            return;
        }
        if (!neuronsListNode.hasChildNodes()){
            Object.entries(this._resultBoxes).forEach(entry => {
                entry[1].classList.add('result');
                neuronsListNode.appendChild(entry[1])
            });
        }
    }

    set results(results) {
        results.forEach(result => {
            this._resultBoxes[result.id] = this._resultBoxes[result.id] || document.createElement('div');
            this._resultBoxes[result.id].innerText = result.result;
        });
        this.renderResultBoxes()
    }
}

customElements.define('agent-results-view', AgentResults);