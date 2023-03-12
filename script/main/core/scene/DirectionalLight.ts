import vec3, { Vec3 } from "../math/vec3.js";
import FrameDirtyRecord from "./FrameDirtyRecord.js";

export default class DirectionalLight extends FrameDirtyRecord {
    private _position: Vec3 = vec3.create();
    get position(): Readonly<Vec3> {
        return this._position;
    }
    set position(value: Readonly<Vec3>) {
        Object.assign(this._position, value);
        this.hasChanged = 1;
    }
}