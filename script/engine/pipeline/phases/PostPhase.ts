import { Queue, RecycleQueue } from "bastard";
import { Batch } from "../../core/render/pipeline/Batch.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { quadrat } from "../../core/render/Quadrat.js";
import { Pass } from "../../core/render/scene/Pass.js";

const batch: Batch = {
    draw: { inputAssembler: quadrat.createInputAssembler(quadrat.createVertexBuffer(2, 2, true)), range: { count: 6, first: 0 } },
    *flush() { yield 1 }
}

const batches: Batch[] = []

export class PostPhase extends Phase {
    constructor(private readonly _pass: Pass, visibility: number) {
        super(visibility);
    }

    batch(out: RecycleQueue<Map<Pass, Queue<Batch>>>): void {
        batches.push(batch);
        out.push().set(this._pass, Queue(batches));
    }
}