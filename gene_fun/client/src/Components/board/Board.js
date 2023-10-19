import { WallRenderer } from "./renderers/WallRenderer.js";
import { AreaRenderer } from "./renderers/AreaRenderer.js";
import { AgentRenderer } from "./renderers/AgentRenderer.js";
import { Vector } from "../../scope/Vector.js";
import { EventBus } from "../../EventBus.js";
import { Board as BoardModel } from "../../scope/Board.js"

class Board extends HTMLElement {
    _shadowRoot;
    _boardEl;
    _areasEl;

    _board;

    _frameRenderer;
    _animationFrameRequest;

    constructor() {
        super();
        this._frameRenderer = this.renderBoard.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    connectedCallback() {
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        const template = document.getElementById('board-tpl').content.cloneNode(true);
        this._boardEl = template.querySelector('.map');
        this._areasEl = template.querySelector('.breeding-area');
        this._boardEl.addEventListener('click', this.handleClick);
        this._shadowRoot.appendChild(template);
    }

    disconnectCallback() {
        this._boardEl.removeEventListener('click', this.handleClick);
    }

    handleClick = (e) => {
        const clickVector = new Vector(
            [~~(e.offsetX / (BoardModel.agentSize * 2)), ~~(e.offsetY / (BoardModel.agentSize * 2))],
            [this._board.size.width, this._board.size.height]
        )
        const agent = this._board.findAgent(clickVector);
        if (agent) {
            EventBus.publish('agentClick', { agent, map: this.map })
        }
    }

    clearBoard(ctx) {
        ctx.clearRect(0, 0, this._board.size.width, this._board.size.height);
    }

    renderWalls(ctx) {
        this._wallRenderer = this._wallRenderer || new WallRenderer(ctx);
        this._board.walls.forEach(wall => {
            this._wallRenderer.render(wall)
        })
    }

    renderPopulation(ctx) {
        this._agentRenderer = this._agentRenderer || new AgentRenderer(ctx);
        this._board.population.forEach(el => {
            this._agentRenderer.render(el);
        })
    }

    renderBoard(){
        const ctx = this._boardEl.getContext('2d');
        this.clearBoard(ctx);
        this.renderWalls(ctx);
        this.renderPopulation(ctx);
        this._animationFrameRequest = window.requestAnimationFrame(this._frameRenderer);
    }

    renderAreas() {
        const ctx = this._areasEl.getContext('2d');
        this._areaRenderer = this._areaRenderer || new AreaRenderer(ctx);
        this._board.breedingAreas.forEach(area => {
            this._areaRenderer.render(area, 0)
        });
        this._board.spawnAreas.forEach(area => {
            this._areaRenderer.render(area, 1)
        })
    }

    set board(board) {
        this._board = board;
        this._boardEl.setAttribute('width', this._board.size.width);
        this._boardEl.setAttribute('height', this._board.size.height);
        this._areasEl.setAttribute('width', this._board.size.width);
        this._areasEl.setAttribute('height', this._board.size.height);
        this.renderAreas();
        this.renderBoard();
    }

}

customElements.define('board-view', Board);