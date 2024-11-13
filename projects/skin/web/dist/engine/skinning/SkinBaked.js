export class SkinBaked {
    get descriptorSet() {
        return this._proto.baked.descriptorSet;
    }
    constructor(_proto) {
        this._proto = _proto;
        this.offset = 0;
    }
    update() {
        throw new Error("Method not implemented.");
    }
    upload(commandBuffer) {
        throw new Error("Method not implemented.");
    }
}
