const tpl = `
<style>
div{
    display: flex;
    border-bottom: 1px dotted black;
    justify-content: space-between;
    margin-bottom: 4px;
}
label {
    font-weight: bold;
    display: block;
    background: white;
    margin-bottom: -4px;
}
label:after {
    content: ': '
}
span {
    background: white;
    display: block;
    margin-bottom: -4px;
}
</style>
<div>
    <label></label>
    <span></span>
</div>
`

class TrainingStats extends HTMLElement {
    _shadowRoot;

    label;
    value;

    static get observedAttributes (){ return ['label', 'value'] };

    connectedCallback() {
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        this._shadowRoot.innerHTML = tpl;
        this._displayData();
    }

    attributeChangedCallback(prop, oldVal, newVal) {
        if (oldVal === newVal) {
            return;
        }
        this[prop] = newVal;
        this._displayData();
    }

    _displayData() {
        if (!this._shadowRoot) {
            return;
        }
        this._shadowRoot.querySelector('label').innerText = this.label;
        this._shadowRoot.querySelector('span').innerText = this.value;
    }
}

customElements.define('training-stats-view', TrainingStats);