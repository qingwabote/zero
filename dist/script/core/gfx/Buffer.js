export var BufferUsageBit;
(function (BufferUsageBit) {
    BufferUsageBit[BufferUsageBit["INDEX"] = 4] = "INDEX";
    BufferUsageBit[BufferUsageBit["VERTEX"] = 8] = "VERTEX";
    BufferUsageBit[BufferUsageBit["UNIFORM"] = 16] = "UNIFORM";
})(BufferUsageBit || (BufferUsageBit = {}));
export default class Buffer {
    _info;
    get info() {
        return this._info;
    }
    constructor(info) {
        this._info = info;
    }
}
//# sourceMappingURL=Buffer.js.map