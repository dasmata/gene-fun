
const gpu = new GPU.GPU();

gpu.addFunction(function normalizeNoWrapGpu(nr, base) {
    let val = Math.abs(nr);
    if (nr < 0) {
        val = base - val
    }
    if (val > base) {
        val = Math.abs(val % base)
    }
    return val;
})

const gpuAddArray = gpu.createKernel(function(a, b, base){
    const result = [0, 0];
    for(let i = 0; i < 2; i++){
        result[i] = normalizeNoWrapGpu(
            a[this.thread.x][i] + b[this.thread.x][i],
            base[i]
        );
    }
    return result;
}).setOutput([1]);

const gpuSubtractArray = gpu.createKernel(function(a, b, base){
    const result = [0, 0];
    for(let i = 0; i < 2; i++){
        result[i] = normalizeNoWrapGpu(
            a[this.thread.x][i] - b[this.thread.x][i],
            base[i]
        );
    }
    return result;
}).setOutput([1]);


class Vector extends Array {

    constructor(values = [], base = []) {
        const normalizedBase = values.map((el, idx) => base[idx] || 10)
        const normalizeValue = Vector.noWrapNormalized;
        super(...values.map((el, idx) => normalizeValue(el, normalizedBase[idx])));
        this.base = normalizedBase
        this.normalizeValue = normalizeValue
    }

    add(vct) {
        if(vct.length !== this.length){
            throw new Error('Vector size mismatch')
        }
        // return new Vector(gpuAddArray(
        //     this,
        //     vct,
        //     this.base
        // )[0], this.base)
        return new Vector(
            [...this].map((el, idx) => this.normalizeValue(el + vct[idx], this.base[idx])),
            this.base
        )
    }

    subtract(vct) {
        if(vct.length !== this.length){
            throw new Error('Vector size mismatch')
        }
        // return new Vector(gpuSubtractArray(
        //     this,
        //     vct,
        //     this.base
        // )[0], this.base)
        return new Vector(
            [...this].map((el, idx) => this.normalizeValue(el - vct[idx], this.base[idx])),
            this.base
        )
    }

    equals(vct) {
        return vct[0] === this[0] && vct[1] === this[1];
    }
}

Vector.wrapNormalized = (el, base) => {
    let val = Math.abs(el);
    if (el < 0) {
        val = base - val
    }
    if (val > base) {
        val = Math.abs(val % base)
    }
    return val;
}

Vector.noWrapNormalized = (el, base) => {
    let val = Math.abs(el);
    if (el < 0) {
        val = 0
    }
    if (val > base) {
        val = base
    }
    return val;
}