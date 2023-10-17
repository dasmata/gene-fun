class ScopeNeuron extends GenericNeuron {
    ctx;
    constructor(...args){
        super(...args);
    }

    setContext(ctx) {
        this.ctx = ctx;
    }
}

( self || {} ).ScopeNeuron = ScopeNeuron;
