class AgentRenderer {
    constructor(ctx) {
        this.ctx = ctx
    }

    render(agent) {
        const oldPos = agent.oldPosVector
        if(oldPos){
            this.ctx.clearRect(oldPos[0], oldPos[1], Agent.size, Agent.size);
        }
        if (agent.alive) {
            this.ctx.beginPath();
            this.ctx.rect(agent.x, agent.y, Agent.size, Agent.size);
            this.ctx.fillStyle = agent.color;
            this.ctx.fill();
            this.ctx.closePath();
            agent.oldPosVector = agent.posVector
        }
    }
}