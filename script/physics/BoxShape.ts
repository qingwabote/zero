import { Component, Node, Vec3, vec3 } from 'engine';
import { phys } from 'phys';
import { RigidBody } from './RigidBody.js';

enum DirtyFlagBits {
    NONE = 0,
    SCALE = 1 << 0,
    ORIGIN = 1 << 1,
    ALL = 0xffffffff
}

const physV3_a = phys.fn.physVector3_new();
const physT_a = phys.fn.physTransform_new();

export class BoxShape extends Component {
    private _dirtyFlags = DirtyFlagBits.ALL;

    private _size = vec3.create(0, 0, 0);
    public get size(): Vec3 {
        return this._size;
    }
    public set size(value: Vec3) {
        this._size = value;
        this._dirtyFlags |= DirtyFlagBits.SCALE;
    }

    private _origin = vec3.create(0, 0, 0);
    public get origin(): Vec3 {
        return this._origin;
    }
    public set origin(value: Vec3) {
        this._origin = value;
        this._dirtyFlags |= DirtyFlagBits.ORIGIN;
    }

    readonly body: RigidBody;

    readonly pointer = phys.fn.physBoxShape_new();

    constructor(node: Node) {
        super(node);

        let body = this.node.getComponent(RigidBody);
        if (!body) {
            body = this.node.addComponent(RigidBody);
        }

        phys.fn.physRigidBody_addShape(body.pointer, this.pointer);

        this.body = body;
    }

    override update(): void {
        // if (this.node.hasChangedFlag.hasBit(render.Transform.ChangeBit.SCALE)) {
        //     this._dirtyFlags |= DirtyFlagBits.SCALE;
        // }

        if (this._dirtyFlags & DirtyFlagBits.SCALE) {
            const scale = vec3.multiply(vec3.create(), this._size, this.node.world_scale);
            phys.fn.physVector3_set(physV3_a, ...scale)
            phys.fn.physCollisionShape_setScale(this.pointer, physV3_a);
        }

        if (this._dirtyFlags & DirtyFlagBits.ORIGIN) {
            phys.fn.physVector3_set(physV3_a, ...this._origin)
            phys.fn.physTransform_identity(physT_a);
            phys.fn.physTransform_setPosition(physT_a, physV3_a)
            const body = this.node.getComponent(RigidBody)!;
            phys.fn.physRigidBody_updateShapeTransform(body.pointer, this.pointer, physT_a);
        }

        this._dirtyFlags = DirtyFlagBits.NONE;
    }
}