import "./StatsRow.js";

class Stats extends HTMLElement {

    _stats;
    _shadowRoot;

    constructor() {
        super();
        this._stats = [];
    }

    connectedCallback() {
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
    }

    renderStats(){
        this._shadowRoot.innerHTML = '';
        if (!this._stats) {
            return;
        }
        const template = document.getElementById('stats-tpl').content.cloneNode(true);
        this._stats.forEach(stat => {
            const el = document.createElement('stats-row-view');
            el.setAttribute('label', stat.label);
            if(typeof stat.value !== 'undefined'){
                el.setAttribute('value', stat.value);
            }
            template.querySelector('fieldset.stats').appendChild(el);
        })
        this._shadowRoot.append(template)
    }

    set stats(stats) {
        this._stats = stats;
        this.renderStats();
    }

    get stats(){
        return this._stats;
    }
}

customElements.define('stats-view', Stats);