class StatsRow extends HTMLElement {
    value;
    label;

    _shadowRoot;

    constructor() {
        super();
    }

    static get observedAttributes() {
        return [
            'value',
            'label',
        ]
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if(oldValue === newValue) {
            return;
        }
        this[property] = newValue;
        this.setLabel();
        this.setValue();
    }

    connectedCallback() {
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        const tpl = document.getElementById('stats-row-tpl').content.cloneNode(true);

        this._shadowRoot.appendChild(tpl);
        this.setValue();
        this.setLabel();
    }

    setValue() {
        if(!this._shadowRoot){
            return;
        }

        this._shadowRoot.querySelector('.stats-value').innerText = this.value || 'N/A';
    }

    setLabel() {
        if(!this._shadowRoot){
            return;
        }
        this._shadowRoot.querySelector('.stats-label').innerText = this.label || '';
    }
}

customElements.define('stats-row-view', StatsRow);