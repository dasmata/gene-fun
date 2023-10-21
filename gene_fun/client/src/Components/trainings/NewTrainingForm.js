class NewTrainingForm extends HTMLElement {

    _shadowRoot;

    _dialog;
    _submit;
    _cancel;
    _input;

    constructor() {
        super();

        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    connectedCallback() {
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        const template = document.getElementById('new-training-form-tpl').content.cloneNode(true);
        this._shadowRoot.appendChild(template);
        this._dialog = this._shadowRoot.querySelector('dialog');
        this._submit = this._shadowRoot.getElementById('submit-training');
        this._cancel = this._shadowRoot.getElementById('cancel');
        this._input = this._shadowRoot.querySelector('[name=name]');

        this._cancel.addEventListener('click', this.handleCancel);
        this._submit.addEventListener('click', this.handleSubmit);
    }

    disconnectedCallback(){
        this._cancel.removeEventListener('click', this.handleCancel);
        this._submit.removeEventListener('click', this.handleSubmit);
    }

    handleCancel(e){
        e.preventDefault();
        this.close();
    }

    handleSubmit(e){
        e.preventDefault();

        const evt = new CustomEvent('create', { detail: this._input.value });
        this.dispatchEvent(evt);

        this.close();
    }

    show(){
        this._dialog.showModal();
    }

    close(){
        this._dialog.close(null)
    }
}

customElements.define('new-training-form-view', NewTrainingForm);