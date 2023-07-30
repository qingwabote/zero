import { ClearFlagBits } from "gfx-main";
import { Mat4Like } from "../math/mat4.js";
import { Rect } from "../math/rect.js";
import { Vec3 } from "../math/vec3.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";
import { Transform } from "./Transform.js";

export class Camera extends FrameChangeRecord {

    override get hasChanged(): number {
        if (super.hasChanged || this._transform.hasChanged) {
            return 1;
        }
        return 0;
    }
    override set hasChanged(flags: number) {
        super.hasChanged = flags;
    }

    visibilityFlags = 0;

    clearFlags: ClearFlagBits = ClearFlagBits.COLOR | ClearFlagBits.DEPTH;

    viewport: Rect = { x: 0, y: 0, width: 0, height: 0 };

    private _matView!: Mat4Like;
    get matView(): Mat4Like {
        return this._matView;
    }
    set matView(value: Mat4Like) {
        this._matView = value;
        this.hasChanged = 1;
    }

    private _matProj!: Mat4Like;
    get matProj(): Mat4Like {
        return this._matProj;
    }
    set matProj(value: Mat4Like) {
        this._matProj = value;
        this.hasChanged = 1;
    }

    get position(): Readonly<Vec3> {
        return this._transform.world_position;
    }

    constructor(private _transform: Transform) {
        super();
    }
}