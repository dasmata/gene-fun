class GenericNeuron {
    world = null;
    type = 2;
    id = null;
    process = () => {}

    constructor(world, type, neuronFunction){
        this.world = world;
        this.type = type;
        this.id = Math.random().toString(36).substring(2,7);
        this.process = neuronFunction.bind(this);
    }

    main(agent, input) {
        return this.process(agent, input)
    }
}
( self || {} ).GenericNeuron = GenericNeuron;
