class AgentRenderer {
    constructor(ctx) {
        this.ctx = ctx
    }

    render(agent) {
        this.ctx.beginPath();
        this.ctx.rect(agent.actionValue[0], agent.actionValue[1], Map.agentSize, Map.agentSize);
        this.ctx.fillStyle = `#${agent.genes.fingerprint}`;
        this.ctx.fill();
        this.ctx.closePath();
    }
}