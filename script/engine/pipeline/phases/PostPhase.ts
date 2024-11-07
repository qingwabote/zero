import { Batch } from "../../core/render/pipeline/Batch.js";
import { BatchQueue } from "../../core/render/pipeline/BatchQueue.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { quad } from "../../core/render/quad.js";
import { Pass } from "../../core/render/scene/Pass.js";

const batches: Batch[] = [{ inputAssembler: quad.createInputAssembler(quad.createVertexBuffer(2, 2, true)), draw: { count: 6, first: 0 }, count: 1 }]

export class PostPhase extends Phase {
    constructor(private readonly _pass: Pass, visibility: number) {
        super(visibility);
    }

    batch(out: BatchQueue): void {
        out.push().set(this._pass, batches);
    }
}