import { CommandBuffer } from "gfx";
import { Data } from "./pipeline/Data.js";
import { Flow } from "./pipeline/Flow.js";
import { Profile } from "./pipeline/Profile.js";
import { UBO } from "./pipeline/UBO.js";
import { Camera } from "./scene/Camera.js";

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

    update(profile: Profile) {
        this.data.update(profile, this._dumping);
    }

    upload() {
        for (const ubo of this.ubos) {
            ubo.update(this._dumping);
        }

        this._dumping = false;
    }

    record(profile: Profile, commandBuffer: CommandBuffer, cameras: readonly Camera[]) {
        for (this.data.cameraIndex = 0; this.data.cameraIndex < cameras.length; this.data.cameraIndex++) {
            for (const flow of this.flows) {
                if (this.data.current_camera.visibilities & flow.visibilities) {
                    flow.record(profile, commandBuffer);
                }
            }
        }
    }
}