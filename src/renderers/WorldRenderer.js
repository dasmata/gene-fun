class WorldRenderer extends Observable{
    container = null;
    agentRenderer = null;
    wallRenderer = null;
    areaRenderer = null;
    world = null;

    constructor(world) {
        super();
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
                payload:  { agent, world: this.world }
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
        if(this.container){
            document.getElementById('canvas-wrapper').removeChild(this.container);
            this.container.removeEventListener('click', this.handleClick)
            this.container = null;
        }
    }

    render() {
        if (!this.world) {
           return;
        }

        this.renderMap();
        this.renderAreas();
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
        ctx.clearRect(0, 0, this.world.size.width, this.world.size.height);
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

    renderAreas() {
        this.areaRenderer = this.areaRenderer || new AreaRenderer(this.world);
        this.world.breedingAreas.forEach(area => {
            this.areaRenderer.render(area, 0)
        });
        this.world.spawnAreas.forEach(area => {
            this.areaRenderer.render(area, 1)
        })
    }

    clear() {
        window.cancelAnimationFrame(this.frameRenderer);
        this.destroyContainer();
        this.areaRenderer.clear();
        this.world = null;
    }
}