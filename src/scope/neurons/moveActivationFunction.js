const moveActivationFunction = (agent, input) => {
    // Sigmoid
    return Math.round(1 / (1 + Math.exp(input * -1)));
}