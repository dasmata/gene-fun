import { Board } from "./Board.js";

class SpawningBounds {
    areaData = [];
    totalSpawnArea = 0;
    populationDensity = 0;
    layerSize = 0;
    currentLayer = 0;
    currentArea = 0;
    placedLayer = 0;
    placedArea = 0;

    constructor(spawningAreas, populationSize) {
        ({ areaData: this.areaData, totalSpawnArea: this.totalSpawnArea } = spawningAreas);
        this.populationDensity = populationSize / this.totalSpawnArea;
        this.layerSize = Board.agentSize * 3;

    }

    adjustLayer () {
        this.placedLayer++;
        const layerDensity = this.placedLayer / (this.layerSize * this.areaData[this.currentArea].size.width);
        if (layerDensity >= this.populationDensity) {
            this.currentLayer++;
            this.placedLayer = 0;
        }
    }

    adjustArea () {
        this.placedArea++;
        const areaDensity = this.placedArea / this.areaData[this.currentArea].surface;
        if (areaDensity >= this.populationDensity) {
            this.currentArea++;
            this.placedArea = 0;
            this.currentLayer = 0;
            this.placedLayer = 0;
        }
    }

    getBounds () {
        return {
            vStart: (this.currentLayer * this.layerSize) + this.areaData[this.currentArea].location[1],
            vSize: this.layerSize - (Board.agentSize - 1),
            hStart: this.areaData[this.currentArea].location[0],
            hSize: this.areaData[this.currentArea].size.width - (Board.agentSize - 1)
        }
    }
}

export { SpawningBounds }