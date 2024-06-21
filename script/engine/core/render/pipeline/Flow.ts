import { CommandBuffer, Uint32Vector } from "gfx";
import { Context } from "./Context.js";
import { Data } from "./Data.js";
import { Profile } from "./Profile.js";
import { Stage } from "./Stage.js";
import { UBO } from "./UBO.js";

export class Flow {
    constructor(
        private readonly _data: Data,
        private readonly _context: Context,
        private readonly _ubos: readonly UBO[],
        public readonly stages: readonly Stage[],
        public readonly visibilities: number,
        private readonly _loops?: Function[]
    ) { }

    record(commandCalls: Profile, commandBuffer: CommandBuffer) {
        for (this._data.flowLoopIndex = 0; this._data.flowLoopIndex < (this._loops?.length ?? 1); this._data.flowLoopIndex++) {
            this._loops?.[this._data.flowLoopIndex]();

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