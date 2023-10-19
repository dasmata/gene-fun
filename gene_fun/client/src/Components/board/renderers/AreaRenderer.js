class AreaRenderer {
    ctx;

    constructor(ctx) {
        this.ctx = ctx;
    }

    render(area, type) {
        this.ctx.beginPath();
        this.ctx.globalAlpha = 0.1;
        this.ctx.rect(area[0][0], area[0][1], area[1][0] - area[0][0], area[1][1] - area[0][1]);
        this.ctx.fillStyle = AreaRenderer.colors[type || 0];
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.globalAlpha = 1;
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

export { AreaRenderer }