import { CommandBuffer, Texture } from "gfx";
import { Data } from "./pipeline/Data.js";
import { Flow } from "./pipeline/Flow.js";
import { Status } from "./pipeline/Status.js";
import { UBO } from "./pipeline/UBO.js";
import { Scene } from "./Scene.js";

export class Pipeline {
    private _dumping = false;

    constructor(
        public readonly data: Data,
        public readonly textures: Readonly<Record<string, Texture>>,
        public readonly ubos: readonly UBO[],
        public readonly flows: readonly Flow[]
    ) { }

    dump() {
        this._dumping = true;
    }

    update() {
        this.data.update(this._dumping);
    }

    cull() {
        this.data.cull();
    }

    batch(scene: Scene) {
        for (let i = 0; i < scene.cameras.length; i++) {
            for (const flow of this.flows) {
                flow.batch(scene, i);
            }
        }
    }

    render(status: Status, scene: Scene, commandBuffer: CommandBuffer) {
        for (const ubo of this.ubos) {
            ubo.upload(scene, commandBuffer, this._dumping);
        }
        this._dumping = false;

        for (let i = 0; i < scene.cameras.length; i++) {
            for (const flow of this.flows) {
                flow.render(status, scene, commandBuffer, i);
            }
        }
    }
}