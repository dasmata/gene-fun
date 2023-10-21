const tpl = `
            <style>
            :host{
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            div {
                border: 16px solid #f3f3f3; /* Light grey */
                border-top: 16px solid #3498db; /* Blue */
                border-radius: 50%;
                width: 120px;
                height: 120px;
                animation: spin 2s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            </style>
            <div></div>
        `;

class Loader extends HTMLElement {

    _template;

    constructor() {
        super();
        this._template = document.createElement('template');
        this._template.innerHTML = tpl;
    }

    connectedCallback(){
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.appendChild(this._template.content.cloneNode(true));
    }

}


customElements.define('loader-view', Loader);