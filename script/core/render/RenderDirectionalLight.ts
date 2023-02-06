import vec3, { Vec3 } from "../math/vec3.js";
import RenderObject from "./RenderObject.js";

export default class RenderDirectionalLight extends RenderObject {
    private _position: Vec3 = vec3.create();
    get position(): Readonly<Vec3> {
        return this._position;
    }
    set position(value: Readonly<Vec3>) {
        Object.assign(this._position, value);
        this.hasChanged = 1;
    }
}