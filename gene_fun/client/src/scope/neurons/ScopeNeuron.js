import { GenericNeuron } from "../../engine/GenericNeuron.js";

class ScopeNeuron extends GenericNeuron {
    ctx;
    constructor(...args){
        super(...args);
    }

    setContext(ctx) {
        this.ctx = ctx;
    }
}

export { ScopeNeuron }