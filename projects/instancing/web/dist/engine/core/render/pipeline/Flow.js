import { Uint32Vector } from "gfx";
import { Zero } from "../../Zero.js";
export class Flow {
    constructor(_context, _ubos, stages, visibilities, _loops) {
        this._context = _context;
        this._ubos = _ubos;
        this.stages = stages;
        this.visibilities = visibilities;
        this._loops = _loops;
    }
    record(commandCalls, commandBuffer, cameraIndex) {
        var _a, _b, _c;
        const camera = Zero.instance.scene.cameras[cameraIndex];
        for (let i = 0; i < ((_b = (_a = this._loops) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1); i++) {
            (_c = this._loops) === null || _c === void 0 ? void 0 : _c[i]();
            const params = { cameraIndex };
            const dynamicOffsets = new Uint32Vector;
            for (const uniform of this._ubos) {
                const offset = uniform.dynamicOffset(params);
                if (offset != -1) {
                    dynamicOffsets.add(offset);
                }
            }
            commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);
            for (const stage of this.stages) {
                if (camera.visibilities & stage.visibilities) {
                    stage.record(commandCalls, commandBuffer, cameraIndex);
                }
            }
        }
    }
}
