class StatsRenderer {
    genMarkerElement;
    currentElements;
    wrapper;

    generationsNr;
    constructor(wrapper){
        this.generationsNr = 0;
        this.currentElements = [];
        this.genMarkerElement = document.getElementById('gen');
        this.statsElement = document.getElementById('stats').content.cloneNode(true).querySelector('.stats');
        this.statsValueTpl = this.statsElement.querySelector('.stats-row');
        this.statsElement.removeChild(this.statsValueTpl);
        this.wrapper = wrapper;
        EventBus.subscribe('stopRender', this.clear.bind(this));
    }

    render(generationStats){
        if(generationStats){
            this.renderGenerationStats(generationStats);
        }
        if(!this.wrapper.contains(this.statsElement)){
            this.wrapper.appendChild(this.statsElement);
        }
        this.genMarkerElement.textContent = this.generationsNr;
        this.generationsNr++;
    }

    renderGenerationStats(stats){
        this.currentElements.forEach(el => {
            this.statsElement.removeChild(el);
        });
        this.currentElements = [];
        this.statsElement.appendChild(this.createStatEl('Current population:', stats.population));
        this.statsElement.appendChild(this.createStatEl('Old population size:', stats.armageddonStats?.populationSize));
        this.statsElement.appendChild(this.createStatEl('Parents', stats.armageddonStats?.replicatorsNr));
        this.statsElement.appendChild(this.createStatEl('Survivability', (stats.armageddonStats?.survivability || 'N/A') + '%' ));
        this.statsElement.appendChild(this.createStatEl('Max. Survivability', (stats.armageddonStats?.maxSurvivability || 'N/A') + '%' ));

    }

    createStatEl(label, value){
        const el = this.statsValueTpl.cloneNode(true);
        el.querySelector('.stats-label').textContent = label;
        el.querySelector('.stats-value').textContent = value || 'N/A:';
        this.currentElements.push(el);
        return el
    }

    clear(){
        this.generationsNr = 0;
        this.genMarkerElement.textContent = this.generationsNr;
        this.currentElements.forEach(el => {
            this.statsElement.removeChild(el);
        });
        this.wrapper.removeChild(this.statsElement);
        this.currentElements = [];
    }
}