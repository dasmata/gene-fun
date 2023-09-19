class WorldRenderer {
    container = null
    agentRenderer = null
    world = null;
    observers = new Set();

    constructor(world) {
        this.world = world
        this.frameRenderer = this.render.bind(this)
    }

    handleClick = (e) => {
        const clickVector = new Vector(
            [~~(e.offsetX / (Agent.size * 2)), ~~(e.offsetY / (Agent.size * 2))],
            [this.world.size.width, this.world.size.height]
        )
        const agent = this.world.findAgent(clickVector);
        if (agent) {
            this.notify({
                type: 'click',
                payload: agent
            })
        }
    }

    createContainer(size) {
        const el = document.createElement('canvas');
        el.classList.add('world');
        el.setAttribute('width', size.width);
        el.setAttribute('height', size.height);
        el.addEventListener('click', this.handleClick)

        return el;
    }

    destroyContainer() {
        document.getElementById('canvas-wrapper').removeChild(this.container);
        this.container.removeEventListener('click', this.handleClick)
        this.container = null;
    }

    render() {
        if (!this.world) {
           return;
        }
        if( !this.container ){
            this.container = this.createContainer(this.world.size);
            document.getElementById('canvas-wrapper').appendChild(this.container);
        }
        const ctx = this.container.getContext('2d');
        this.agentRenderer = this.agentRenderer || new AgentRenderer(ctx);
        this.world.agents.forEach(el => {
            this.agentRenderer.render(el);
        })
        window.requestAnimationFrame(this.frameRenderer);
    }

    clear() {
        window.cancelAnimationFrame(this.frameRenderer);
        this.destroyContainer();
        this.world = null;
    }

    attach(obj) {
        this.observers.add(obj)
    }
    detach(obj) {
        this.observers.delete(obj)
    }
    notify(e) {
        this.observers.forEach(obs => obs(e))
    }
}