import { ScopeNeuron } from "./ScopeNeuron.js";

class VisionNeuron extends ScopeNeuron {
    sightRange = 0;
    defaultVal = 1;
    constructor(...args){
        super(...args);
        this.sightRange = 256;
    }
}

export { VisionNeuron }