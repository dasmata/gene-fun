class VisionNeuron extends ScopeNeuron {
    sightRange = 0;
    constructor(...args){
        super(...args);
        this.sightRange = 256;
    }
}
( self || {} ).VisionNeuron = VisionNeuron;
