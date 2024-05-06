import { CommandBuffer } from "gfx";
import { Zero } from "../Zero.js";
import { Data } from "./pipeline/Data.js";
import { Flow } from "./pipeline/Flow.js";
import { Profile } from "./pipeline/Profile.js";
import { UBO } from "./pipeline/UBO.js";

export class Pipeline {
    private _dumping = false;

    constructor(
        public readonly data: Data,
        public readonly ubos: readonly UBO[],
        private readonly _flows: readonly Flow[]
    ) { }

    dump() {
        this._dumping = true;
    }

    update() {
        this.data.update(this._dumping);

        for (const ubo of this.ubos) {
            ubo.update(this._dumping);
        }

        this._dumping = false;
    }

    record(profile: Profile, commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = Zero.instance.scene.cameras[cameraIndex];

        for (const flow of this._flows) {
            if (camera.visibilities & flow.visibilities) {
                flow.record(profile, commandBuffer, cameraIndex);
            }
        }
    }
}