const EventBus = (() => {
    class EventBus {
        subscribers;

        constructor(){
            this.subscribers = {};
        }

        subscribe(channel, clbk){
            this.subscribers[channel] = this.subscribers[channel] || new Set();
            this.subscribers[channel].add(clbk);
            return () => {
                this.unsubscribe(channel, clbk);
            }
        }

        publish(channel, params) {
            this.subscribers[channel]?.forEach(clbk => clbk(params));
        }

        unsubscribe(channel, clbk){
            this.subscribers[channel]?.delete(clbk);
        }
    }
    const bus = new EventBus();
    return {
        subscribe: bus.subscribe.bind(bus),
        publish: bus.publish.bind(bus)
    }
})();

export { EventBus }
