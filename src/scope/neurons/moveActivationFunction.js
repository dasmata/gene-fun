const moveActivationFunction = (agent, input) => {
    // return Math.round(1 / (1 + Math.exp(input * -1)));
    return input > 0 ? 1 : 0;
}