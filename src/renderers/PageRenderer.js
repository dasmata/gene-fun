class PageRenderer {
    killBtn;
    createBtn;
    pauseBtn;
    playBtn;
    saveCurrentBtn;
    controlsElement;
    saveBestBtn;
    levelIndicator;
    actionsSlider;
    genesSlider;
    survivabilitySlider;
    page;

    fileUploader;

    constructor(page){
        this.page = page;
        this.createBtn = document.getElementById('start');
        this.killBtn = document.getElementById('killSw');
        this.pauseBtn = document.getElementById('pause');
        this.playBtn = document.getElementById('play');
        this.controlsElement = document.getElementById('controls');
        this.saveCurrentBtn = document.getElementById('save-current');
        this.saveBestBtn = document.getElementById('save-best');
        this.fileUploader = document.getElementById('import-population');
        this.levelIndicator = document.getElementById('level-indicator');
        this.actionsSlider = document.getElementById('actions-slider');
        this.genesSlider = document.getElementById('genes-slider');
        this.survivabilitySlider = document.getElementById('survivability-slider');

        this.createClickHandler = this.createClickHandler.bind(this);
        this.playClickHandler = this.playClickHandler.bind(this);
        this.pauseClickHandler = this.pauseClickHandler.bind(this);
        this.killClickHandler = this.killClickHandler.bind(this);
        this.saveBestClickHandler = this.saveBestClickHandler.bind(this);
        this.saveCurrentClickHandler = this.saveCurrentClickHandler.bind(this);
        this.handleAgentsImport = this.handleAgentsImport.bind(this);
        this.handleParamsChange = this.handleParamsChange.bind(this);

        this.createBtn.addEventListener('click', this.createClickHandler)
        this.saveBestBtn.addEventListener('click', this.saveBestClickHandler)
        this.saveCurrentBtn.addEventListener('click', this.saveCurrentClickHandler)
        this.fileUploader.addEventListener('change', this.handleAgentsImport);
        this.levelIndicator.addEventListener('change', this.handleParamsChange);
        this.actionsSlider.addEventListener('change', this.handleParamsChange);
        this.genesSlider.addEventListener('change', this.handleParamsChange);
        this.survivabilitySlider.addEventListener('change', this.handleParamsChange);
        this.setInitialParams();
    }

    setInitialParams(){
        this.levelIndicator.value = 0;
        this.actionsSlider.value = this.page.actions;
        this.actionsSlider.nextElementSibling.value = this.actionsSlider.value;
        this.genesSlider.value = this.page.geneNumber;
        this.genesSlider.nextElementSibling.value = this.genesSlider.value;
        this.survivabilitySlider.value = this.page.survivabilityThreshold;
        this.survivabilitySlider.nextElementSibling.value = this.survivabilitySlider.value;
        EventBus.subscribe('paramChange', e => {
           switch(e.name){
               case 'level':
                   this.levelIndicator.value = parseInt(e.value);
                   break;
           }
        });
    }

    handleParamsChange(e) {
        EventBus.publish('paramChange', {
           name: e.target.name,
           value: e.target.value
        })
    }

    handleAgentsImport(e){
        const reader = new FileReader();
        reader.addEventListener('load', evt => {
            const agents = JSON.parse(evt.target.result);
            if(agents?.length > 0){
                EventBus.publish('importAgents', agents);
            }
        });
        reader.readAsText(e.target.files[0])
    }

    killClickHandler(e){
        this.playBtn.removeEventListener('click', this.playClickHandler);
        this.pauseBtn.removeEventListener('click', this.pauseClickHandler);
        this.createBtn.addEventListener('click', this.createClickHandler);
        EventBus.publish('kill', e);
    }

    playClickHandler(e){
        this.playBtn.removeEventListener('click', this.playClickHandler);
        EventBus.publish('play', e);
    }

    pauseClickHandler(e){
        this.playBtn.removeEventListener('click', this.playClickHandler);
        this.playBtn.addEventListener('click', this.playClickHandler);
        EventBus.publish('pause', e);
    }

    createClickHandler(e) {
        this.setReadyState()
        EventBus.publish('create', e);
    }

    saveBestClickHandler(){
        EventBus.publish('save', 'best');
    }

    saveCurrentClickHandler(){
        EventBus.publish('save', 'current');
    }

    setReadyState(){
        this.pauseBtn.addEventListener('click', this.pauseClickHandler);
        this.killBtn.addEventListener('click', this.killClickHandler);
        this.createBtn.removeEventListener('click', this.createClickHandler);
        this.playBtn.addEventListener('click', this.playClickHandler);
    }
}