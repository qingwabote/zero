import { RecycleQueue } from "bastard";
import { Batch } from "../../core/render/pipeline/Batch.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { quadrat } from "../../core/render/Quadrat.js";
import { Pass } from "../../core/render/scene/Pass.js";

const batches: Batch[] = [{ inputAssembler: quadrat.createInputAssembler(quadrat.createVertexBuffer(2, 2, true)), draw: { count: 6, first: 0 }, flush() { return 1 } }]

export class PostPhase extends Phase {
    constructor(private readonly _pass: Pass, visibility: number) {
        super(visibility);
    }

    batch(out: RecycleQueue<Map<Pass, Batch[]>>): void {
        out.push().set(this._pass, batches);
    }
}