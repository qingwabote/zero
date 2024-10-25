import { CommandBuffer } from "gfx";
import { Data } from "./pipeline/Data.js";
import { Flow } from "./pipeline/Flow.js";
import { Profile } from "./pipeline/Profile.js";
import { UBO } from "./pipeline/UBO.js";
import { Scene } from "./Scene.js";

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

    upload(commandBuffer: CommandBuffer) {
        for (const ubo of this.ubos) {
            ubo.update(commandBuffer, this._dumping);
        }

        this._dumping = false;
    }

    record(profile: Profile, commandBuffer: CommandBuffer, scene: Scene) {
        for (let i = 0; i < scene.cameras.length; i++) {
            for (const flow of this.flows) {
                if (scene.cameras[i].visibilities & flow.visibilities) {
                    flow.record(profile, commandBuffer, scene, i);
                }
            }
        }
    }
}