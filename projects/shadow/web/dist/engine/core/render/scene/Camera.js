import { ClearFlagBits } from "gfx";
import { FrameChangeRecord } from "./FrameChangeRecord.js";
export class Camera extends FrameChangeRecord {
    get hasChanged() {
        if (super.hasChanged || this._transform.hasChanged) {
            return 1;
        }
        return 0;
    }
    set hasChanged(flags) {
        super.hasChanged = flags;
    }
    get matView() {
        return this._matView;
    }
    set matView(value) {
        this._matView = value;
        this.hasChanged = 1;
    }
    get matProj() {
        return this._matProj;
    }
    set matProj(value) {
        this._matProj = value;
        this.hasChanged = 1;
    }
    get position() {
        return this._transform.world_position;
    }
    constructor(_transform) {
        super();
        this._transform = _transform;
        this.visibilities = 0;
        this.clears = ClearFlagBits.COLOR | ClearFlagBits.DEPTH;
        this.viewport = { x: 0, y: 0, width: 0, height: 0 };
    }
}
