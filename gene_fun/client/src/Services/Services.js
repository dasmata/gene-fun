// import { Logger } from "./Logger.js";
// import { Training } from "./Training.js";
// import { Rest } from "./Rest.js";


const serviceMap = {
    rest: {
        constructor: 'Rest',
        params: []
    },
    training: {
        constructor: 'Training',
        params: ['rest']
    },
    population: {
        constructor: 'Population',
        params: ['rest']
    },
    logger: {
        constructor: 'Logger',
        params: []
    }
}

export default {
    async get(serviceName){
        if (!serviceMap[serviceName]) {
            throw new Error('Invalid service name');
        }
        // Primitive implementation: doesn't handle circular dependencies
        // But GOOD ENOUGH
        const params = await Promise.all(serviceMap[serviceName].params.map(param => this.get(param)))
        const module = await import(`./${serviceMap[serviceName].constructor}.js`);
        const ServiceConstructor = module[serviceMap[serviceName].constructor];

        if (!ServiceConstructor) {
            throw new Error(`Could not load service ${serviceName}`)
        }

        return new ServiceConstructor(...params);
    }
}