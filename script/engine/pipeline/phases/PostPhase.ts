import { Batch } from "../../core/render/pipeline/Batch.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { quad } from "../../core/render/quad.js";
import { Pass } from "../../core/render/scene/Pass.js";

const batch: Batch = { inputAssembler: quad.createInputAssembler(quad.createVertexBuffer(2, 2, true)), draw: { count: 6, first: 0 }, count: 1 }

export class PostPhase extends Phase {
    constructor(private readonly _pass: Pass, visibility: number) {
        super(visibility);
    }

    batch(buffer_pass: Pass[], buffer_batch: Batch[], buffer_index: number): number {
        buffer_pass[buffer_index] = this._pass;
        buffer_batch[buffer_index] = batch;
        return ++buffer_index;
    }
}