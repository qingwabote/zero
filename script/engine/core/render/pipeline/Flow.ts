import { CommandBuffer, Uint32Vector } from "gfx";
import { Zero } from "../../Zero.js";
import { Context } from "../Context.js";
import { CommandCalls } from "./CommandCalls.js";
import { Parameters } from "./Parameters.js";
import { Stage } from "./Stage.js";
import { UniformBufferObject } from "./UniformBufferObject.js";

export class Flow {
    constructor(
        private readonly _context: Context,
        readonly uniforms: readonly UniformBufferObject[],
        private readonly _stages: readonly Stage[],
        private readonly _loops?: Function[]
    ) { }

    update() {
        for (const uniform of this.uniforms) {
            uniform.update();
        }
    }

    record(commandCalls: CommandCalls, commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = Zero.instance.scene.cameras[cameraIndex];
        const stages = this._stages.filter(stage => camera.visibilities & stage.visibilities);
        if (stages.length == 0) {
            return 0;
        }

        for (let i = 0; i < (this._loops?.length ?? 1); i++) {
            this._loops?.[i]();

            const params: Parameters = { cameraIndex };

            const dynamicOffsets = new Uint32Vector;
            for (const uniform of this.uniforms) {
                const offset = uniform.dynamicOffset(params);
                if (offset > 0) {
                    dynamicOffsets.add(offset);
                }
            }
            commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);
            for (const stage of stages) {
                stage.record(commandCalls, commandBuffer, cameraIndex);
            }
        }
    }
}