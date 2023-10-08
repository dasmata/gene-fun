class VisionNeuron extends ScopeNeuron {
    sightRange = 0;
    defaultVal = 4;
    constructor(...args){
        super(...args);
        this.sightRange = 256;
    }
}
( self || {} ).VisionNeuron = VisionNeuron;
