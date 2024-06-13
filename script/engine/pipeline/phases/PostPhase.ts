import { CommandBuffer, PassState, RenderPass } from "gfx";
import { Context } from "../../core/render/pipeline/Context.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { quad } from "../../core/render/quad.js";

const inputAssembler = quad.createInputAssembler(quad.createVertexBuffer(2, 2, true));

export class PostPhase extends Phase {
    constructor(context: Context, private _passState: PassState, visibility: number) {
        super(context, visibility);
    }

    record(profile: Profile, commandBuffer: CommandBuffer, renderPass: RenderPass) {
        const pipeline = this._context.getPipeline(this._passState, inputAssembler.vertexAttributes, renderPass);
        commandBuffer.bindPipeline(pipeline);
        commandBuffer.bindInputAssembler(inputAssembler);
        commandBuffer.drawIndexed(6, 0, 1)
        profile.draws++;
    }
}