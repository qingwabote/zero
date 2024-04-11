import { device } from "boot";
export class UBO {
    constructor() {
        this._visibilities = 0;
    }
    static align(size) {
        const alignment = device.capabilities.uniformBufferOffsetAlignment;
        return Math.ceil(size / alignment) * alignment;
    }
    get visibilities() {
        return this._visibilities;
    }
    set visibilities(value) {
        this._visibilities = value;
    }
    get range() { return 0; }
    ;
    dynamicOffset(paramm) { return -1; }
    ;
    use() { }
    ;
    update() { }
    ;
}
