import { device } from "boot";
export class UBO {
    static align(size) {
        const alignment = device.capabilities.uniformBufferOffsetAlignment;
        return Math.ceil(size / alignment) * alignment;
    }
    constructor(_data, _visibilities) {
        this._data = _data;
        this._visibilities = _visibilities;
    }
    dynamicOffset(paramm) { return -1; }
    ;
}
