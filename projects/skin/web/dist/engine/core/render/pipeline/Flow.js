import { Uint32Vector } from "gfx";
export class Flow {
    constructor(context, _uniforms, _stages) {
        this.context = context;
        this._uniforms = _uniforms;
        this._stages = _stages;
    }
    update() {
        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }
    record(commandBuffer) {
        let drawCall = 0;
        const dynamicOffsets = new Uint32Vector;
        for (const uniform of this._uniforms) {
            const offset = uniform.dynamicOffset(this.context);
            if (offset != -1) {
                dynamicOffsets.add(offset);
            }
        }
        commandBuffer.bindDescriptorSet(0, this.context.descriptorSet, dynamicOffsets);
        for (const stage of this._stages) {
            drawCall += stage.record(commandBuffer);
        }
        return drawCall;
    }
}
