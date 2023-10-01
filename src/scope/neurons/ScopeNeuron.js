class ScopeNeuron extends GenericNeuron {
    mapData;
    constructor(...args){
        super(...args);
    }

    setMap(mapData) {
        this.mapData = mapData;
    }
}

( self || {} ).ScopeNeuron = ScopeNeuron;
