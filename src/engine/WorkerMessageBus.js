const WorkerMessageBus = function(workers) {
    class Bus {
        workers;
        subscribers;
        msgId;
        receiverNum;

        buffers;

        constructor(workers){
            this.buffers = {};
            this.msgId = 0;
            this.workers = workers;
            this.receiverNum = {};
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
            const msgId = msg.data.payload.requestId;
            this.buffers[msgId] = this.buffers[msgId] || [];
            this.buffers[msgId][this.workers.indexOf(msg.target)] = msg.data;

            if(this.buffers[msgId].filter(el => el !== undefined).length === this.receiverNum[msgId]){
                this.subscribers[msg.data.type]?.forEach(clbk => clbk(this.buffers[msgId]));
                delete this.buffers[msgId];
                delete this.receiverNum[msgId];
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

            if(this.receiverNum[requestId]){
                this.receiverNum[requestId]++;
            } else if(target) {
                this.receiverNum[requestId] = 1;
            } else {
                this.receiverNum[requestId] = this.workers.length;
            }

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