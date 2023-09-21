class AgentRenderer {
    constructor(ctx) {
        this.ctx = ctx
    }

    render(agent) {
        if (agent.alive) {
            this.ctx.beginPath();
            this.ctx.rect(agent.x, agent.y, Agent.size, Agent.size);
            this.ctx.fillStyle = agent.color;
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
}