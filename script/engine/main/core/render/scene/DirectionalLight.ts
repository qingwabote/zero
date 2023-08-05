import { Vec3Like } from "../../math/vec3.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";
import { Transform } from "./Transform.js";

export class DirectionalLight extends FrameChangeRecord {
    override get hasChanged(): number {
        if (super.hasChanged || this._transform.hasChanged) {
            return 1;
        }
        return 0;
    }
    override set hasChanged(flags: number) {
        super.hasChanged = flags;
    }

    get position(): Readonly<Vec3Like> {
        return this._transform.world_position;
    }

    constructor(private _transform: Transform) {
        super();
    }
}