class VisionNeuron extends ScopeNeuron {
    sightRange = 0;
    constructor(...args){
        super(...args);
        this.sightRange = 100;
    }
}
( self || {} ).VisionNeuron = VisionNeuron;
