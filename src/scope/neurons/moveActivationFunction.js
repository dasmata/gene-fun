const moveActivationFunction = function (agent, input){
    if (input === 0) {
        return 0
    }
    return Math.round(1 / (1 + Math.exp(input * -1)));
}