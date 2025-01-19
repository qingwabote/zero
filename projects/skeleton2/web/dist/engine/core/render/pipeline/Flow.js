import { Uint32Vector } from "gfx";
export class Flow {
    constructor(_context, _ubos, stages, _visibilities, _flowLoopIndex) {
        this._context = _context;
        this._ubos = _ubos;
        this.stages = stages;
        this._visibilities = _visibilities;
        this._flowLoopIndex = _flowLoopIndex;
    }
    batch(context, cameraIndex) {
        if ((context.scene.cameras[cameraIndex].visibilities & this._visibilities) == 0) {
            return;
        }
        for (const stage of this.stages) {
            stage.batch(context, cameraIndex);
        }
    }
    render(context, cameraIndex) {
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
        for (const stage of this.stages) {
            stage.render(context, cameraIndex);
        }
    }
}
