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

    upload(context: Context) {
        for (const ubo of this.ubos) {
            ubo.update(context, this._dumping);
        }

        this._dumping = false;
    }

    record(context: Context) {
        for (let i = 0; i < context.scene.cameras.length; i++) {
            for (const flow of this.flows) {
                if (context.scene.cameras[i].visibilities & flow.visibilities) {
                    flow.record(context, i);
                }
            }
        }
    }
}