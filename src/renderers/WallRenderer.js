class WallRenderer {
    constructor(ctx) {
        this.ctx = ctx
    }

    render(wall) {
        this.ctx.beginPath();
        this.ctx.rect(wall[0][0], wall[0][1], wall[1][0] - wall[0][0], wall[1][1] - wall[0][1]);
        this.ctx.fillStyle = '#c4c4c4';
        this.ctx.fill();
        this.ctx.closePath();
    }
}