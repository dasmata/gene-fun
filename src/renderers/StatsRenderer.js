class StatsRenderer {
    genMarkerElement;

    generationsNr;
    constructor(){
        this.generationsNr = 0;
        this.genMarkerElement = document.getElementById('gen');
    }

    render(generationStats){
        if(generationStats){
            console.log(generationStats)
        }
        this.genMarkerElement.textContent = this.generationsNr;
        this.generationsNr++;
    }

    clear(){
        this.generationsNr = 0;
        this.genMarkerElement.textContent = this.generationsNr;
    }
}