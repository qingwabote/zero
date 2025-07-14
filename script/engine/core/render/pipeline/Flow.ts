import { CommandBuffer, Uint32Vector } from "gfx";
import { Scene } from "../Scene.js";
import { FlowContext } from "./FlowContext.js";
import { Stage } from "./Stage.js";
import { Status } from "./Status.js";
import { UBO } from "./UBO.js";

export class Flow {
    constructor(
        private readonly _context: FlowContext,
        private readonly _ubos: readonly UBO[],
        readonly stages: readonly Stage[],
        private readonly _visibilities: number,
        private readonly _flowLoopIndex: number,
    ) { }

    batch(scene: Scene, cameraIndex: number) {
        if ((scene.cameras[cameraIndex].visibilities & this._visibilities) == 0) {
            return;
        }

        for (const stage of this.stages) {
            stage.batch(scene, cameraIndex);
        }
    }

    render(status: Status, scene: Scene, commandBuffer: CommandBuffer, cameraIndex: number) {
        if ((scene.cameras[cameraIndex].visibilities & this._visibilities) == 0) {
            return;
        }

        const dynamicOffsets = new Uint32Vector;
        for (const uniform of this._ubos) {
            const offset = uniform.dynamicOffset(scene, cameraIndex, this._flowLoopIndex);
            if (offset != -1) {
                dynamicOffsets.add(offset);
            }
        }
        commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);

        for (const stage of this.stages) {
            stage.render(status, scene, commandBuffer, cameraIndex);
        }
    }
}