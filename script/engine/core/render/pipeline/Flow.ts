import { CommandBuffer, Uint32Vector } from "gfx";
import { Scene } from "../Scene.js";
import { Context } from "./Context.js";
import { Profile } from "./Profile.js";
import { Stage } from "./Stage.js";
import { UBO } from "./UBO.js";

export class Flow {
    constructor(
        private readonly _context: Context,
        private readonly _ubos: readonly UBO[],
        public readonly stages: readonly Stage[],
        public readonly visibilities: number,
        private readonly _flowLoopIndex: number,
    ) { }

    record(profile: Profile, commandBuffer: CommandBuffer, scene: Scene, cameraIndex: number) {
        const dynamicOffsets = new Uint32Vector;
        for (const uniform of this._ubos) {
            const offset = uniform.dynamicOffset(scene, cameraIndex, this._flowLoopIndex);
            if (offset != -1) {
                dynamicOffsets.add(offset);
            }
        }
        commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);
        for (const stage of this.stages) {
            if (scene.cameras[cameraIndex].visibilities & stage.visibilities) {
                stage.record(profile, commandBuffer, scene, cameraIndex);
            }
        }
    }
}