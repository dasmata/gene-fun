class MapRenderer extends Observable{
    container = null;
    agentRenderer = null;
    wallRenderer = null;
    areaRenderer = null;
    map = null;

    constructor(map) {
        super();
        this.map = map
        this.frameRenderer = this.renderMap.bind(this)
    }

    handleClick = (e) => {
        const clickVector = new Vector(
            [~~(e.offsetX / (Map.agentSize * 2)), ~~(e.offsetY / (Map.agentSize * 2))],
            [this.map.size.width, this.map.size.height]
        )
        const agent = this.map.findAgent(clickVector);
        if (agent) {
            this.notify({
                type: 'agentClick',
                payload:  { agent, map: this.map }
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
            this.agentRenderer = null;
            this.wallRenderer = null;
        }
    }

    render() {
        if (!this.map) {
           return;
        }

        this.renderAreas();
        this.renderMap();
    }

    renderMap() {
        if (!this.map) {
            return;
        }
        if( !this.container ){
            this.container = this.createContainer(this.map.size);
            this.container.addEventListener('click', this.handleClick)
            this.container.classList.add('map');
            document.getElementById('canvas-wrapper').appendChild(this.container);
        }
        const ctx = this.container.getContext('2d');
        ctx.clearRect(0, 0, this.map.size.width, this.map.size.height);
        this.renderPopulation(ctx);
        this.renderWalls(ctx);
        window.requestAnimationFrame(this.frameRenderer);
    }

    renderPopulation(ctx) {
        this.agentRenderer = this.agentRenderer || new AgentRenderer(ctx);
        this.map.population.forEach(el => {
            this.agentRenderer.render(el);
        })
    }

    renderWalls(ctx) {
        this.wallRenderer = this.wallRenderer || new WallRenderer(ctx);
        this.map.walls.forEach(wall => {
            this.wallRenderer.render(wall)
        })
    }

    renderAreas() {
        this.areaRenderer = this.areaRenderer || new AreaRenderer(this.map);
        this.map.breedingAreas.forEach(area => {
            this.areaRenderer.render(area, 0)
        });
        this.map.spawnAreas.forEach(area => {
            this.areaRenderer.render(area, 1)
        })
    }

    clear() {
        window.cancelAnimationFrame(this.frameRenderer);
        this.destroyContainer();
        this.areaRenderer.clear();
    }
}