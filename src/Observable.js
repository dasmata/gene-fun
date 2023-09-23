class Observable {
    observers;

    constructor() {
        this.observers = new Set();
    }

    attach(observer){
        if (typeof observer.update !== 'function') {
            throw new Error('Observers must have an update function');
        }
        this.observers.add(observer);
        this.notify({
            type: 'attached',
            payload: observer
        })
    }

    detach(observer) {
        this.observers.delete(observer)
    }

    notify(e) {
        let res = null;
        this.observers.forEach(obs => {
            if(res === false){
                return;
            }
            res = obs.update(e)
        })
        return res;
    }
}