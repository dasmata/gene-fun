import { EventBus } from "../../EventBus.js";

class Import extends HTMLElement {
    saveCurrentBtn;
    saveBestBtn;
    fileUploader;

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'closed' });
        const template = document.getElementById('import-tpl').content.cloneNode(true);

        this.saveCurrentBtn = template.getElementById('save-current');
        this.saveBestBtn = template.getElementById('save-best');
        this.fileUploader = template.getElementById('import-population');

        this.setActionHandlers();
        shadow.append(template);
    }

    setActionHandlers(){
        this.saveBestClickHandler = this.saveBestClickHandler.bind(this);
        this.saveCurrentClickHandler = this.saveCurrentClickHandler.bind(this);
        this.handleAgentsImport = this.handleAgentsImport.bind(this);

        this.saveBestBtn.addEventListener('click', this.saveBestClickHandler)
        this.saveCurrentBtn.addEventListener('click', this.saveCurrentClickHandler)
        this.fileUploader.addEventListener('change', this.handleAgentsImport);
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

    saveBestClickHandler(){
        EventBus.publish('save', 'best');
    }

    saveCurrentClickHandler(){
        EventBus.publish('save', 'current');
    }
}

customElements.define('import-view', Import);
