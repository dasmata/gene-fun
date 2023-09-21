class GenericNeuron {
    world = null;
    type = 2;
    id = null;
    main = () => {}

    constructor(world, neuronFunction){
        this.world = world;
        this.id = Math.random().toString(36).substring(2,7);
        this.main = neuronFunction.bind(this);
    }
}