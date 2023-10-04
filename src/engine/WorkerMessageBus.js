const WorkerMessageBus = function(workers) {
    class Bus {
        workers;
        subscribers;
        msgId;

        buffers;

        constructor(workers){
            this.buffers = {};
            this.msgId = 0;
            this.workers = workers;
            this.subscribers = {};
            this.workers.forEach(worker => {
                worker.addEventListener('message', msg => this.handleMessages(msg));
            })
        }

        handleMessages(msg) {
            if (!msg.data.payload?.requestId) {
                this.subscribers[msg.data.type]?.forEach(clbk => clbk(msg));
                return;
            }
            this.buffers[msg.data.payload.requestId] = this.buffers[msg.data.payload.requestId] || [];
            this.buffers[msg.data.payload.requestId][this.workers.indexOf(msg.target)] = msg.data;

            if(this.buffers[msg.data.payload.requestId].length === this.workers.length && !this.buffers[msg.data.payload.requestId].includes(undefined)){
                this.subscribers[msg.data.type]?.forEach(clbk => clbk(this.buffers[msg.data.payload.requestId]));
                delete this.buffers[msg.data.payload.requestId];
            }
        }

        subscribe(topic, callback){
            this.subscribers[topic] = this.subscribers[topic] || [];
            this.subscribers[topic].push(callback);
            return () => {
                this.unsubscribe(topic, callback);
            }
        }

        publish(topic, msg, target, id) {
            const requestId = id || ++this.msgId;
            const message = {
                type: topic,
                payload: {
                    ...msg,
                    requestId
                }
            };
            if (target) {
                target.postMessage(message);
            } else {
                this.workers.forEach(worker => worker.postMessage(message));
            }
            return requestId;
        }

        unsubscribe(topic, callback){
            this.subscribers[topic] = this.subscribers[topic]?.filter(clbk => clbk !== callback);
        }
    }
    const bus = new Bus(workers);

    return {
        subscribe: bus.subscribe.bind(bus),
        publish: bus.publish.bind(bus)
    }
}