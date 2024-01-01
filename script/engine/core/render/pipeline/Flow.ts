import { CommandBuffer, DescriptorType, Uint32Vector } from "gfx";
import { Context } from "../Context.js";
import { Root } from "../scene/Root.js";
import { Stage } from "./Stage.js";
import { Uniform } from "./Uniform.js";
import { UniformBufferObject } from "./UniformBufferObject.js";

export class Flow {
    constructor(
        private readonly _context: Context,
        private readonly _uniforms: readonly Uniform[],
        private readonly _stages: readonly Stage[]
    ) {
    }

    update() {
        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer, scene: Root): number {
        let drawCall = 0;
        for (this._context.cameraIndex = 0; this._context.cameraIndex < scene.cameras.length; this._context.cameraIndex++) {
            const camera = scene.cameras[this._context.cameraIndex];
            const dynamicOffsets = new Uint32Vector;
            for (const uniform of this._uniforms) {
                if ((uniform.constructor as typeof Uniform).definition.type == DescriptorType.UNIFORM_BUFFER_DYNAMIC) {
                    dynamicOffsets.add((uniform as UniformBufferObject).dynamicOffset);
                }
            }
            commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);
            for (const stage of this._stages) {
                drawCall += stage.record(commandBuffer, scene, camera);
            }
        }
        return drawCall;
    }
}