class AgentRenderer {
    constructor(ctx) {
        this.ctx = ctx
    }

    render(agent) {
        if (agent.alive) {
            this.ctx.beginPath();
            this.ctx.rect(agent.x, agent.y, Map.agentSize, Map.agentSize);
            this.ctx.fillStyle = agent.color;
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
}