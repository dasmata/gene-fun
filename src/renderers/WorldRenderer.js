class WorldRenderer {
    container = null;
    breedingAreasContainer;
    agentRenderer = null;
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
        document.getElementById('canvas-wrapper').removeChild(this.breedingAreasContainer);
        this.container.removeEventListener('click', this.handleClick)
        this.container = null;
        this.breedingAreasContainer = null;
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
        this.world.walls.forEach(wall => {
            ctx.beginPath();
            ctx.rect(wall[0][0], wall[0][1], wall[1][0] - wall[0][0], wall[1][1] - wall[0][1]);
            ctx.fillStyle = '#c4c4c4';
            ctx.fill();
            ctx.closePath();
        })
    }

    renderBreedingAreas() {
        if( !this.breedingAreasContainer ){
            this.breedingAreasContainer = this.createContainer(this.world.size);
            this.breedingAreasContainer.addEventListener('click', this.handleClick)
            this.breedingAreasContainer.classList.add('breeding-area');
            document.getElementById('canvas-wrapper').appendChild(this.breedingAreasContainer);
        }
        const ctx = this.breedingAreasContainer.getContext('2d');
        this.world.breedingAreas.forEach(area => {
            ctx.beginPath();
            ctx.globalAlpha = 0.1;
            ctx.rect(area[0][0], area[0][1], area[1][0] - area[0][0], area[1][1] - area[0][1]);
            ctx.fillStyle = "#FFFF66";
            ctx.fill();
            ctx.closePath();
            ctx.globalAlpha = 1;
        })
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