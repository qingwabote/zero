import { CommandBuffer, Uint32Vector } from "gfx";
import { Zero } from "../../Zero.js";
import { Context } from "./Context.js";
import { Parameters } from "./Parameters.js";
import { Profile } from "./Profile.js";
import { Stage } from "./Stage.js";
import { UBO } from "./UBO.js";

export class Flow {
    constructor(
        private readonly _context: Context,
        private readonly _ubos: readonly UBO[],
        public readonly stages: readonly Stage[],
        public readonly visibilities: number,
        private readonly _loops?: Function[]
    ) { }

    record(commandCalls: Profile, commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = Zero.instance.scene.cameras[cameraIndex];

        for (let i = 0; i < (this._loops?.length ?? 1); i++) {
            this._loops?.[i]();

            const params: Parameters = { cameraIndex };

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