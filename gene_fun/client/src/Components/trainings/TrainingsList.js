
import './Training.js';
import './NewTrainingForm.js';

class TrainingsList extends HTMLElement {
    _shadowRoot;
    _trainings;
    _newTrainingBtn;

    _container;

    constructor() {
        super();
        this._trainings = [];
        this.handleTrainingClick = this.handleTrainingClick.bind(this);
        this.handleNewTrainingClick = this.handleNewTrainingClick.bind(this)
    }

    connectedCallback(){
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        const template = document.getElementById('trainings-list-tpl').content.cloneNode(true);
        this._container = template.querySelector('ul.training-list')
        this._shadowRoot.appendChild(template);
        this._newTrainingBtn = this._shadowRoot.querySelector('button');
        this._newTrainingBtn.addEventListener('click', this.handleNewTrainingClick);
        this.renderList();
    }

    disconnectedCallback(){
        this._shadowRoot.querySelectorAll('training-view').forEach(el => {
            el.removeEventListener('click', this.handleTrainingClick);
        });
        this._newTrainingBtn.removeEventListener('click', this.handleNewTrainingClick);
    }

    handleNewTrainingClick() {
        const evt = new CustomEvent('createClick');
        this.dispatchEvent(evt);
    }

    handleTrainingClick(e) {
        const evt = new CustomEvent('select', {detail: e.target.training.training});
        this.dispatchEvent(evt);
    }

    renderList() {
        if (!this._shadowRoot) {
            return;
        }
        this._container.innerHTML = '';
        const tmpFragment = document.createDocumentFragment();
        this._trainings.forEach(training => {
            const el = document.createElement('training-view');
            el.training = training;
            el.addEventListener('click', this.handleTrainingClick)
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