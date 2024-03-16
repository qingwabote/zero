import { CommandBuffer, PassState, RenderPass } from "gfx";
import { Context } from "../../core/render/Context.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { quad } from "../../core/render/quad.js";

const inputAssembler = quad.createInputAssembler(quad.createVertexBuffer(2, 2, true));

export class PostPhase extends Phase {
    constructor(context: Context, private _passState: PassState, visibility: number) {
        super(context, visibility);
    }

    record(commandBuffer: CommandBuffer, renderPass: RenderPass): number {
        const pipeline = this._context.getPipeline(this._passState, inputAssembler, renderPass);
        commandBuffer.bindPipeline(pipeline);
        commandBuffer.bindInputAssembler(inputAssembler);
        commandBuffer.drawIndexed(6, 0)
        return 1;
    }
}