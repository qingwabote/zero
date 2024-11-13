import { Phase } from "../../core/render/pipeline/Phase.js";
import { quad } from "../../core/render/quad.js";
const batches = [{ inputAssembler: quad.createInputAssembler(quad.createVertexBuffer(2, 2, true)), draw: { count: 6, first: 0 }, count: 1 }];
export class PostPhase extends Phase {
    constructor(_pass, visibility) {
        super(visibility);
        this._pass = _pass;
    }
    batch(out) {
        out.push().set(this._pass, batches);
    }
}
