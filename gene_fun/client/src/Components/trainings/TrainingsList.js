
import './Training.js';

class TrainingsList extends HTMLElement {
    _shadowRoot;
    _trainings;

    _container;

    constructor() {
        super();
        this._trainings = [];
        this.handTrainingClick = this.handTrainingClick.bind(this);
    }

    connectedCallback(){
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        const template = document.getElementById('trainings-list-tpl').content.cloneNode(true);
        this._container = template.querySelector('ul.training-list')
        this._shadowRoot.appendChild(template);
        this.renderList();
    }

    disconnectedCallback(){
        this._shadowRoot.querySelectorAll('training-view').forEach(el => {
            el.removeEventListener('click', this.handTrainingClick);
        })
    }

    handTrainingClick(e) {
        const evt = new CustomEvent('select', {detail: e.target.training});
        this.dispatchEvent(evt);
    }

    renderList() {
        if (!this._shadowRoot) {
            return;
        }
        const tmpFragment = document.createDocumentFragment();
        this._trainings.forEach(training => {
            const el = document.createElement('training-view');
            el.training = training;
            el.addEventListener('click', this.handTrainingClick)
            tmpFragment.appendChild(el);
        });
        this._container.appendChild(tmpFragment);
    }

    set trainings(data){
        this._trainings = data;
        this.renderList();
    }
}

customElements.define('trainings-list-view', TrainingsList);