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
        return new Vector(
            [...this].map((el, idx) => this.normalizeValue(el + vct[idx], this.base[idx])),
            this.base
        )
    }

    subtract(vct) {
        if(vct.length !== this.length){
            throw new Error('Vector size mismatch')
        }
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