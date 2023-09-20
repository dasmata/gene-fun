class WorldRenderer {
    container = null;
    agentRenderer = null;
    wallRenderer = null;
    world = null;
    observers = new Set();

    constructor(world) {
        this.world = world
        this.frameRenderer = this.renderMap.bind(this)
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
        el.setAttribute('width', size.width);
        el.setAttribute('height', size.height);

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
        this.renderMap();
        this.renderBreedingAreas();
    }

    renderMap() {
        if (!this.world) {
            return;
        }
        if( !this.container ){
            this.container = this.createContainer(this.world.size);
            this.container.addEventListener('click', this.handleClick)
            this.container.classList.add('world');
            document.getElementById('canvas-wrapper').appendChild(this.container);
        }
        const ctx = this.container.getContext('2d');
        this.renderAgents(ctx);
        this.renderWalls(ctx);
        window.requestAnimationFrame(this.frameRenderer);
    }

    renderAgents(ctx) {
        this.agentRenderer = this.agentRenderer || new AgentRenderer(ctx);
        this.world.agents.forEach(el => {
            this.agentRenderer.render(el);
        })
    }

    renderWalls(ctx) {
        this.wallRenderer = this.wallRenderer || new WallRenderer(ctx);
        this.world.walls.forEach(wall => {
            this.wallRenderer.render(wall)
        })
    }

    renderBreedingAreas() {
        this.breedingAreasRenderer = this.breedingAreasRenderer || new BreedingAreasRenderer(this.world);
        this.world.breedingAreas.forEach(area => {
            this.breedingAreasRenderer.render(area)
        })
    }

    clear() {
        window.cancelAnimationFrame(this.frameRenderer);
        this.destroyContainer();
        this.breedingAreasRenderer.clear();
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