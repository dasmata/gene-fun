class Controls extends HTMLElement {
    killBtn;
    createBtn;
    pauseBtn;
    playBtn;

    levelIndicator;
    actionsSlider;
    genesSlider;
    survivabilitySlider;

    // attributes
    actions;
    geneNumber;
    survivabilityThreshold;

    static get observedAttributes() {
        return [
            'actions',
            'gene-number',
            'survivability-threshold'
        ]
    }

    constructor() {
        super();
    }

    attributeChangedCallback(property, oldValue, newValue) {
        const propName = property.split('-').map((el, idx) => {
            if(idx === 0){
                return el;
            }
            return el.charAt(0).toUpperCase() + el.slice(1)
        }).join('')
        if(oldValue === newValue) {
            return;
        }
        this[propName] = newValue;
        this.setInitialParams();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'closed' });
        const template = document.getElementById('controls-tpl').content.cloneNode(true);
        this.createBtn = template.getElementById('start');
        this.killBtn = template.getElementById('killSw');
        this.pauseBtn = template.getElementById('pause');
        this.playBtn = template.getElementById('play');
        this.levelIndicator = template.getElementById('level-indicator');
        this.actionsSlider = template.getElementById('actions-slider');
        this.genesSlider = template.getElementById('genes-slider');
        this.survivabilitySlider = template.getElementById('survivability-slider')

        this.addListeners();
        this.setInitialParams();
        shadow.append(template)
    }

    addListeners() {
        this.createClickHandler = this.createClickHandler.bind(this);
        this.playClickHandler = this.playClickHandler.bind(this);
        this.pauseClickHandler = this.pauseClickHandler.bind(this);
        this.killClickHandler = this.killClickHandler.bind(this);
        this.handleParamsChange = this.handleParamsChange.bind(this);

        this.createBtn.addEventListener('click', this.createClickHandler)
        this.levelIndicator.addEventListener('change', this.handleParamsChange);
        this.actionsSlider.addEventListener('change', this.handleParamsChange);
        this.genesSlider.addEventListener('change', this.handleParamsChange);
        this.survivabilitySlider.addEventListener('change', this.handleParamsChange);
        // EventBus.subscribe('paramChange', e => {
        //     switch(e.name){
        //         case 'level':
        //             this.levelIndicator.value = parseInt(e.value);
        //             break;
        //     }
        // });
    }

    setInitialParams(){
        this.levelIndicator.value = 0;
        this.actionsSlider.value = this.actions;
        this.actionsSlider.nextElementSibling.value = this.actionsSlider.value;
        this.genesSlider.value = this.geneNumber;
        this.genesSlider.nextElementSibling.value = this.genesSlider.value;
        this.survivabilitySlider.value = this.survivabilityThreshold;
        this.survivabilitySlider.nextElementSibling.value = this.survivabilitySlider.value;
    }

    handleParamsChange(e) {
        const evt = new CustomEvent('paramChange', { detail: {
            name: e.target.name,
            value: e.target.value
        }});
        this.dispatchEvent(evt);
    }

    killClickHandler(e){
        this.playBtn.removeEventListener('click', this.playClickHandler);
        this.pauseBtn.removeEventListener('click', this.pauseClickHandler);
        this.createBtn.addEventListener('click', this.createClickHandler);
        const evt = new CustomEvent('kill');
        this.dispatchEvent(evt);
    }

    playClickHandler(e){
        this.playBtn.removeEventListener('click', this.playClickHandler);
        const evt = new CustomEvent('play');
        this.dispatchEvent(evt);
    }

    pauseClickHandler(e){
        this.playBtn.removeEventListener('click', this.playClickHandler);
        this.playBtn.addEventListener('click', this.playClickHandler);
        const evt = new CustomEvent('pause');
        this.dispatchEvent(evt);
    }

    createClickHandler(e) {
        this.setReadyState()
        const evt = new CustomEvent('create');
        this.dispatchEvent(evt);
    }


    setReadyState(){
        this.pauseBtn.addEventListener('click', this.pauseClickHandler);
        this.killBtn.addEventListener('click', this.killClickHandler);
        this.createBtn.removeEventListener('click', this.createClickHandler);
        this.playBtn.addEventListener('click', this.playClickHandler);
    }
}

customElements.define('controls-view', Controls);