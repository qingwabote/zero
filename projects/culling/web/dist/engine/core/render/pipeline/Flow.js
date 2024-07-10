import { Uint32Vector } from "gfx";
export class Flow {
    constructor(_data, _context, _ubos, stages, visibilities, _loops) {
        this._data = _data;
        this._context = _context;
        this._ubos = _ubos;
        this.stages = stages;
        this.visibilities = visibilities;
        this._loops = _loops;
    }
    record(commandCalls, commandBuffer) {
        var _a, _b, _c;
        for (this._data.flowLoopIndex = 0; this._data.flowLoopIndex < ((_b = (_a = this._loops) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1); this._data.flowLoopIndex++) {
            (_c = this._loops) === null || _c === void 0 ? void 0 : _c[this._data.flowLoopIndex]();
            const dynamicOffsets = new Uint32Vector;
            for (const uniform of this._ubos) {
                const offset = uniform.dynamicOffset;
                if (offset != -1) {
                    dynamicOffsets.add(offset);
                }
            }
            commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);
            for (const stage of this.stages) {
                if (this._data.current_camera.visibilities & stage.visibilities) {
                    stage.record(commandCalls, commandBuffer);
                }
            }
        }
    }
}
