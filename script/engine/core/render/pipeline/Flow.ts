import { Uint32Vector } from "gfx";
import { Context } from "../Context.js";
import { FlowContext } from "./FlowContext.js";
import { Stage } from "./Stage.js";
import { UBO } from "./UBO.js";

export class Flow {
    constructor(
        private readonly _context: FlowContext,
        private readonly _ubos: readonly UBO[],
        private readonly _stages: readonly Stage[],
        private readonly _visibilities: number,
        private readonly _flowLoopIndex: number,
    ) { }

    batch(context: Context, cameraIndex: number) {
        if ((context.scene.cameras[cameraIndex].visibilities & this._visibilities) == 0) {
            return;
        }

        for (const stage of this._stages) {
            stage.batch(context, cameraIndex);
        }
    }

    render(context: Context, cameraIndex: number) {
        if ((context.scene.cameras[cameraIndex].visibilities & this._visibilities) == 0) {
            return;
        }

        const dynamicOffsets = new Uint32Vector;
        for (const uniform of this._ubos) {
            const offset = uniform.dynamicOffset(context, cameraIndex, this._flowLoopIndex);
            if (offset != -1) {
                dynamicOffsets.add(offset);
            }
        }
        context.commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);

        for (const stage of this._stages) {
            stage.render(context, cameraIndex);
        }
    }
}