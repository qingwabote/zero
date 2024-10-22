import { Component, vec3 } from 'engine';
import * as phys from 'phys';
import { RigidBody } from './RigidBody.js';
var DirtyFlagBits;
(function (DirtyFlagBits) {
    DirtyFlagBits[DirtyFlagBits["NONE"] = 0] = "NONE";
    DirtyFlagBits[DirtyFlagBits["SCALE"] = 1] = "SCALE";
    DirtyFlagBits[DirtyFlagBits["ORIGIN"] = 2] = "ORIGIN";
    DirtyFlagBits[DirtyFlagBits["ALL"] = 4294967295] = "ALL";
})(DirtyFlagBits || (DirtyFlagBits = {}));
const phys_vec3_a = new phys.Vec3;
const phys_transform_a = new phys.Transform;
export class BoxShape extends Component {
    get size() {
        return this._size;
    }
    set size(value) {
        this._size = value;
        this._dirtyFlags |= DirtyFlagBits.SCALE;
    }
    get origin() {
        return this._origin;
    }
    set origin(value) {
        this._origin = value;
        this._dirtyFlags |= DirtyFlagBits.ORIGIN;
    }
    constructor(node) {
        super(node);
        this._dirtyFlags = DirtyFlagBits.ALL;
        this._size = vec3.create(0, 0, 0);
        this._origin = vec3.create(0, 0, 0);
        let body = this.node.getComponent(RigidBody);
        if (!body) {
            body = this.node.addComponent(RigidBody);
        }
        this._impl = new phys.BoxShape;
        body.impl.addShape(this._impl);
        this.body = body;
    }
    update() {
        // if (this.node.hasChangedFlag.hasBit(render.Transform.ChangeBit.SCALE)) {
        //     this._dirtyFlags |= DirtyFlagBits.SCALE;
        // }
        if (this._dirtyFlags & DirtyFlagBits.SCALE) {
            const scale = vec3.multiply(vec3.create(), this._size, this.node.world_scale);
            phys_vec3_a.set(...scale);
            this._impl.scale = phys_vec3_a;
        }
        if (this._dirtyFlags & DirtyFlagBits.ORIGIN) {
            phys_vec3_a.set(...this._origin);
            phys_transform_a.identity();
            phys_transform_a.position = phys_vec3_a;
            const body = this.node.getComponent(RigidBody);
            body.impl.updateShapeTransform(this._impl, phys_transform_a);
        }
        this._dirtyFlags = DirtyFlagBits.NONE;
    }
}
