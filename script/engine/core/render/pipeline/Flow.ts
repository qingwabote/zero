import { CommandBuffer, Uint32Vector } from "gfx";
import { Zero } from "../../Zero.js";
import { CommandCalls } from "./CommandCalls.js";
import { Context } from "./Context.js";
import { Parameters } from "./Parameters.js";
import { Stage } from "./Stage.js";
import { UBO } from "./UBO.js";

export class Flow {
    readonly visibilities: number;

    constructor(
        private readonly _context: Context,
        private readonly _ubos: readonly UBO[],
        private readonly _stages: readonly Stage[],
        private readonly _loops?: Function[]
    ) {
        let visibilities = 0;
        for (const stages of _stages) {
            visibilities |= stages.visibilities;
        }
        this.visibilities = visibilities;
    }

    record(commandCalls: CommandCalls, commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = Zero.instance.scene.cameras[cameraIndex];

        for (let i = 0; i < (this._loops?.length ?? 1); i++) {
            this._loops?.[i]();

            const params: Parameters = { cameraIndex };

            const dynamicOffsets = new Uint32Vector;
            for (const uniform of this._ubos) {
                const offset = uniform.dynamicOffset(params);
                if (offset > 0) {
                    dynamicOffsets.add(offset);
                }
            }
            commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);
            for (const stage of this._stages) {
                if (camera.visibilities & stage.visibilities) {
                    stage.record(commandCalls, commandBuffer, cameraIndex);
                }
            }
        }
    }
}