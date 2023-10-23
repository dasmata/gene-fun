import { Board } from "../../../scope/Board.js";

class AgentRenderer {
    activeAgent;
    constructor(ctx) {
        this.ctx = ctx
    }

    render(agent) {
        this.ctx.beginPath();
        this.ctx.rect(agent.actionValue[0], agent.actionValue[1], Board.agentSize, Board.agentSize);
        this.ctx.fillStyle = `#${agent.genes.fingerprint}`;
        this.ctx.fill();
        this.ctx.closePath();
        if (agent?.id === this.activeAgent?.id) {
            this.ctx.beginPath();
            this.ctx.arc(agent.actionValue[0] + (Board.agentSize / 2), agent.actionValue[1] + (Board.agentSize / 2), Board.agentSize * 2, 0, 7.8);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }
}

export { AgentRenderer }