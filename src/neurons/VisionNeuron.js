class VisionNeuron extends GenericNeuron {
    sightRange = 0;
    constructor(...args){
        super(...args);
        this.sightRange = 100;
    }
}