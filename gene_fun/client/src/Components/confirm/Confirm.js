const tpl = `<dialog>
    <div class="content"></div>
    <div class="footer">
        <button id="confirm">Confirm</button>
        <button id="cancel">Cancel</button>
    </div>
</dialog>`

class Confirm extends HTMLElement {
    text;

    _shadowRoot;

    static get observedAttributes() {
        return [
            'text'
        ]
    }

    constructor() {
        super();
        this._handleCancelClick = this._handleCancelClick.bind(this);
        this._handleConfirmClick = this._handleConfirmClick.bind(this);
        this._stopClickPropagation = this._stopClickPropagation.bind(this);
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if(oldValue === newValue) {
            return;
        }
        this[property] = newValue;
        this._show();
    }

    connectedCallback(){
        this._shadowRoot = this.attachShadow({mode: 'closed'});
        this._shadowRoot.innerHTML = tpl;

        this._show();

        this._shadowRoot.addEventListener('click', this._stopClickPropagation);
        this._shadowRoot.getElementById('confirm').addEventListener('click', this._handleConfirmClick);
        this._shadowRoot.getElementById('cancel').addEventListener('click', this._handleCancelClick);

    }

    _dispatchConfirmation(confirmation) {
        const evt = new CustomEvent('userConfirmation', { detail: confirmation });
        this.dispatchEvent(evt);
    }

    _stopClickPropagation(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    _handleConfirmClick(e) {
        this._stopClickPropagation(e);
        this._close();
        this._dispatchConfirmation(true);
    }

    _handleCancelClick(e) {
        this._stopClickPropagation(e);
        this._close();
        this._dispatchConfirmation(false);
    }

    _close() {
        this._shadowRoot.getElementById('confirm').removeEventListener('click', this._handleConfirmClick);
        this._shadowRoot.getElementById('cancel').removeEventListener('click', this._handleCancelClick);
        this._shadowRoot.removeEventListener('click', this._stopClickPropagation);
        this._shadowRoot.querySelector('dialog').close(null);
    }

    _show() {
        if (!this._shadowRoot){
            return;
        }
        this._shadowRoot.querySelector('.content').innerText = this.text;
        this._shadowRoot.querySelector('dialog').showModal();
    }
}

customElements.define('confirm-view', Confirm);