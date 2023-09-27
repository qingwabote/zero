export abstract class RayResultCallback {
    hasHit(): boolean {
        return this.impl.hasHit();
    }

    constructor(readonly impl: any) { }
}