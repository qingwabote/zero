import { CommandBuffer, Uint32Vector } from "gfx";
import { Context } from "../Context.js";
import { Stage } from "./Stage.js";
import { UniformBufferObject } from "./UniformBufferObject.js";

export class Flow {
    constructor(
        readonly context: Context,
        readonly uniforms: readonly UniformBufferObject[],
        private readonly _stages: readonly Stage[]
    ) {
    }

    update() {
        for (const uniform of this.uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer): number {
        let drawCall = 0;
        const dynamicOffsets = new Uint32Vector;
        for (const uniform of this.uniforms) {
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