const processingVoidNeuron = function (agent, input) {
    // relu
    return input ? Math.max(0, input) : 0;
}