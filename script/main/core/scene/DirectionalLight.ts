import { Vec3 } from "../math/vec3.js";
import FrameChangeRecord from "./FrameChangeRecord.js";
import Transform from "./Transform.js";

export default class DirectionalLight extends FrameChangeRecord {
    override get hasChanged(): number {
        if (super.hasChanged || this._transform.hasChanged) {
            return 1;
        }
        return 0;
    }
    override set hasChanged(flags: number) {
        super.hasChanged = flags;
    }

    get position(): Readonly<Vec3> {
        return this._transform.world_position;
    }

    constructor(private _transform: Transform) {
        super();
    }
}