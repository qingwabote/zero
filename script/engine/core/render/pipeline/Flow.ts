import { CommandBuffer, DescriptorType, Uint32Vector } from "gfx";
import { Context } from "../Context.js";
import { Stage } from "./Stage.js";
import { Uniform } from "./Uniform.js";
import { UniformBufferObject } from "./UniformBufferObject.js";

export class Flow {
    constructor(
        readonly context: Context,
        private readonly _uniforms: readonly Uniform[],
        private readonly _stages: readonly Stage[]
    ) {
    }

    update() {
        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer): number {
        let drawCall = 0;
        const dynamicOffsets = new Uint32Vector;
        for (const uniform of this._uniforms) {
            if ((uniform.constructor as typeof Uniform).definition.type == DescriptorType.UNIFORM_BUFFER_DYNAMIC) {
                dynamicOffsets.add((uniform as UniformBufferObject).dynamicOffset);
            }
        }
        commandBuffer.bindDescriptorSet(0, this.context.descriptorSet, dynamicOffsets);
        for (const stage of this._stages) {
            drawCall += stage.record(commandBuffer);
        }

        return drawCall;
    }
}