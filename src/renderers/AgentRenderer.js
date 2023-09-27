class AgentRenderer {
    constructor(ctx) {
        this.ctx = ctx
    }

    render(agent) {
        if (agent.alive) {
            this.ctx.beginPath();
            this.ctx.rect(agent.x, agent.y, Map.agentSize, Map.agentSize);
            this.ctx.fillStyle = `#${agent.genes.fingerprint}`;
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
}