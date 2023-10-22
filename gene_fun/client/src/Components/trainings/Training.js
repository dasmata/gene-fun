import '../confirm/Confirm.js';
import './TrainingStats.js';

class Training extends HTMLElement {
    _shadowRoot;
    _deleteBtn;

    _training;

    constructor() {
        super();
        this._handleDeleteClick = this._handleDeleteClick.bind(this);
    }

    connectedCallback(){
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        const template = document.getElementById('training-tpl').content.cloneNode(true);
        this._shadowRoot.appendChild(template)
        this._deleteBtn = this._shadowRoot.getElementById('delete');
        this._deleteBtn.addEventListener('click', this._handleDeleteClick, true);
        this._renderTraining();
    }

    disconnectedCallback() {
        this._deleteBtn.removeEventListener('click', this._handleDeleteClick, true);
    }

    _handleDeleteClick(e) {
        e.stopPropagation();
        const confirm = document.createElement('confirm-view')
        const clbk = (e) => {
            confirm.removeEventListener('userConfirmation', clbk);
            if( e.detail ){
                const evt = new CustomEvent('delete', {
                    detail: this._training.training.id,
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(evt);
            }
        }

        confirm.addEventListener('userConfirmation', clbk)
        confirm.setAttribute('text', 'Are you sure you want to delete this training session?');
        this._shadowRoot.appendChild(confirm);
    }

    _renderTraining(){
        if (!this._shadowRoot) {
            return;
        }
        const { training, ...meta } = this._training;
        this._shadowRoot.querySelector('.name').innerText = training.name;
        this._shadowRoot.querySelector('.author').innerText = 'Unknown author';
        this._shadowRoot.querySelector('.date').innerText = new Intl.DateTimeFormat(navigator.language)
            .format(new Date(training.start_date * 1000));
        const statsContainer = this._shadowRoot.querySelector('.stats');
        Object.entries(meta).forEach(entry => {
            const el = document.createElement('training-stats-view');
            el.setAttribute('label', entry[0]);
            el.setAttribute('value', entry[1]);
            statsContainer.appendChild(el);
        });
    }

    set training(data){
        this._training = data;
        this._renderTraining();
    }

    get training() {
        return this._training;
    }
}

customElements.define('training-view', Training);