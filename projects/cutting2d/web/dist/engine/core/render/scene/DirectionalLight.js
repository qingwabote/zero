import { FrameChangeRecord } from "./FrameChangeRecord.js";
export class DirectionalLight extends FrameChangeRecord {
    get hasChanged() {
        if (super.hasChanged || this._transform.hasChanged) {
            return 1;
        }
        return 0;
    }
    set hasChanged(flags) {
        super.hasChanged = flags;
    }
    get position() {
        return this._transform.world_position;
    }
    constructor(_transform) {
        super();
        this._transform = _transform;
    }
}
