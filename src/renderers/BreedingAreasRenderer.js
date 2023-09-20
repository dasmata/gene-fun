class BreedingAreasRenderer {
    breedingAreasContainer;
    size;

    constructor(world) {
        this.size = world.size;
    }

    createContainer(size) {
        const el = document.createElement('canvas');
        el.setAttribute('width', size.width);
        el.setAttribute('height', size.height);

        return el;
    }

    render(area) {
        if( !this.breedingAreasContainer ){
            this.breedingAreasContainer = this.createContainer(this.size);
            this.breedingAreasContainer.classList.add('breeding-area');
            document.getElementById('canvas-wrapper').appendChild(this.breedingAreasContainer);
        }
        const ctx = this.breedingAreasContainer.getContext('2d');
        ctx.beginPath();
        ctx.globalAlpha = 0.1;
        ctx.rect(area[0][0], area[0][1], area[1][0] - area[0][0], area[1][1] - area[0][1]);
        ctx.fillStyle = "#FFFF66";
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1;
    }

    clear() {
        document.getElementById('canvas-wrapper').removeChild(this.breedingAreasContainer);
        this.breedingAreasContainer = null;
    }
}