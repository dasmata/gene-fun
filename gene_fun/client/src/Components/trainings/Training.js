
class Training extends HTMLElement {
    _shadowRoot;

    _training;

    connectedCallback(){
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        const template = document.getElementById('training-tpl').content.cloneNode(true);
        this._shadowRoot.appendChild(template)
        this._renderTraining();
    }

    _renderTraining(){
        if (!this._shadowRoot) {
            return;
        }
        this._shadowRoot.querySelector('.name').innerText = this._training.name;
        this._shadowRoot.querySelector('.author').innerText = 'Unknown author';
        this._shadowRoot.querySelector('.date').innerText = new Intl.DateTimeFormat(navigator.language).format(new Date(this._training.start_date * 1000));
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