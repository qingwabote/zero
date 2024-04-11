import { Phase } from "../../core/render/pipeline/Phase.js";
import { quad } from "../../core/render/quad.js";
const inputAssembler = quad.createInputAssembler(quad.createVertexBuffer(2, 2, true));
export class PostPhase extends Phase {
    constructor(context, _passState, visibility) {
        super(context, visibility);
        this._passState = _passState;
    }
    record(commandCalls, commandBuffer, renderPass) {
        const pipeline = this._context.getPipeline(this._passState, inputAssembler, renderPass);
        commandBuffer.bindPipeline(pipeline);
        commandBuffer.bindInputAssembler(inputAssembler);
        commandBuffer.drawIndexed(6, 0);
        commandCalls.draws++;
    }
}
