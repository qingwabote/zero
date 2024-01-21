export class RayResultCallback {
    hasHit() {
        return this.impl.hasHit();
    }
    constructor(impl) {
        this.impl = impl;
    }
}
