class AreaRenderer {
    areasContainer;
    size;

    constructor(world) {
        this.size = world.size;
    }

    createContainer(size) {
        const el = document.createElement('canvas');
        el.setAttribute('width', size.width);
        el.setAttribute('height', size.height);

        return el;
    }

    render(area, type) {
        if( !this.areasContainer ){
            this.areasContainer = this.createContainer(this.size);
            this.areasContainer.classList.add('breeding-area');
            document.getElementById('canvas-wrapper').appendChild(this.areasContainer);
        }
        const ctx = this.areasContainer.getContext('2d');
        ctx.beginPath();
        ctx.globalAlpha = 0.1;
        ctx.rect(area[0][0], area[0][1], area[1][0] - area[0][0], area[1][1] - area[0][1]);
        ctx.fillStyle = AreaRenderer.colors[type || 0];
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1;
    }

    clear() {
        if(this.areasContainer) {
            document.getElementById('canvas-wrapper').removeChild(this.areasContainer);
            this.areasContainer = null;
        }
    }
}

AreaRenderer.colors = [
    '#66FF66',
    '#FFFF66'
]