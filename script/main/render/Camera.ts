import { ClearFlagBit } from "../gfx/Pipeline.js";
import { Mat4 } from "../math/mat4.js";
import { Rect } from "../math/rect.js";
import vec3, { Vec3 } from "../math/vec3.js";
import RenderObject from "./RenderObject.js";
import VisibilityBit from "./VisibilityBit.js";

export default class Camera extends RenderObject {

    visibilities: VisibilityBit = VisibilityBit.DEFAULT;

    clearFlags: ClearFlagBit = ClearFlagBit.COLOR | ClearFlagBit.DEPTH;

    viewport: Rect = { x: 0, y: 0, width: 0, height: 0 };

    private _matView!: Mat4;
    get matView(): Mat4 {
        return this._matView;
    }
    set matView(value: Mat4) {
        this._matView = value;
        this.hasChanged = 1;
    }

    private _matProj!: Mat4;
    get matProj(): Mat4 {
        return this._matProj;
    }
    set matProj(value: Mat4) {
        this._matProj = value;
        this.hasChanged = 1;
    }

    private _position: Vec3 = vec3.create();
    get position(): Readonly<Vec3> {
        return this._position;
    }
    set position(value: Readonly<Vec3>) {
        Object.assign(this._position, value);
        this.hasChanged = 1;
    }
}