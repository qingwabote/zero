import { CommandBuffer, Uint32Vector } from "gfx";
import { Context } from "../Context.js";
import { Parameters } from "./Parameters.js";
import { Stage } from "./Stage.js";
import { UniformBufferObject } from "./UniformBufferObject.js";

export class Flow {
    constructor(
        private readonly _context: Context,
        readonly uniforms: readonly UniformBufferObject[],
        private readonly _stages: readonly Stage[]
    ) {
    }

    update() {
        for (const uniform of this.uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer, cameraIndex: number): number {
        const params: Parameters = { cameraIndex };

        const dynamicOffsets = new Uint32Vector;
        for (const uniform of this.uniforms) {
            const offset = uniform.dynamicOffset(params);
            if (offset > 0) {
                dynamicOffsets.add(offset);
            }
        }
        commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);
        let dc = 0;
        for (const stage of this._stages) {
            dc += stage.record(commandBuffer, cameraIndex);
        }

        return dc;
    }
}