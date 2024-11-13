import { Context } from "./Context.js";
import { Data } from "./pipeline/Data.js";
import { Flow } from "./pipeline/Flow.js";
import { UBO } from "./pipeline/UBO.js";

export class Pipeline {
    private _dumping = false;

    constructor(
        public readonly data: Data,
        public readonly ubos: readonly UBO[],
        public readonly flows: readonly Flow[]
    ) { }

    dump() {
        this._dumping = true;
    }

    update(context: Context) {
        this.data.update(context.profile, this._dumping);
    }

    batch(context: Context) {
        for (let i = 0; i < context.scene.cameras.length; i++) {
            for (const flow of this.flows) {
                flow.batch(context, i);
            }
        }
    }

    render(context: Context) {
        for (const ubo of this.ubos) {
            ubo.upload(context, this._dumping);
        }

        for (let i = 0; i < context.scene.cameras.length; i++) {
            for (const flow of this.flows) {
                flow.render(context, i);
            }
        }

        this._dumping = false;
    }
}