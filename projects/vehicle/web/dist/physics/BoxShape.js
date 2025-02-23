import { Component, vec3 } from 'engine';
import { phys } from 'phys';
import { RigidBody } from './RigidBody.js';
var DirtyFlagBits;
(function (DirtyFlagBits) {
    DirtyFlagBits[DirtyFlagBits["NONE"] = 0] = "NONE";
    DirtyFlagBits[DirtyFlagBits["SCALE"] = 1] = "SCALE";
    DirtyFlagBits[DirtyFlagBits["ORIGIN"] = 2] = "ORIGIN";
    DirtyFlagBits[DirtyFlagBits["ALL"] = 4294967295] = "ALL";
})(DirtyFlagBits || (DirtyFlagBits = {}));
const physV3_a = phys.fn.physVector3_new();
const physT_a = phys.fn.physTransform_new();
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
        this.pointer = phys.fn.physBoxShape_new();
        let body = this.node.getComponent(RigidBody);
        if (!body) {
            body = this.node.addComponent(RigidBody);
        }
        phys.fn.physRigidBody_addShape(body.pointer, this.pointer);
        this.body = body;
    }
    update() {
        // if (this.node.hasChangedFlag.hasBit(render.Transform.ChangeBit.SCALE)) {
        //     this._dirtyFlags |= DirtyFlagBits.SCALE;
        // }
        if (this._dirtyFlags & DirtyFlagBits.SCALE) {
            const scale = vec3.multiply(vec3.create(), this._size, this.node.world_scale);
            phys.fn.physVector3_set(physV3_a, ...scale);
            phys.fn.physCollisionShape_setScale(this.pointer, physV3_a);
        }
        if (this._dirtyFlags & DirtyFlagBits.ORIGIN) {
            phys.fn.physVector3_set(physV3_a, ...this._origin);
            phys.fn.physTransform_identity(physT_a);
            phys.fn.physTransform_setPosition(physT_a, physV3_a);
            const body = this.node.getComponent(RigidBody);
            phys.fn.physRigidBody_updateShapeTransform(body.pointer, this.pointer, physT_a);
        }
        this._dirtyFlags = DirtyFlagBits.NONE;
    }
}
