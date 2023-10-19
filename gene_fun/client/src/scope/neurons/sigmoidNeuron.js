const sigmoidNeuron = function(agent, input) {
    return 1 / (1 + Math.exp(input * -1));
}

export { sigmoidNeuron }