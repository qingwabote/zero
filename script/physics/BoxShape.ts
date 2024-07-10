import { Component, Node, Vec3, render, vec3 } from 'engine';
import * as phys from 'phys';
import { RigidBody } from './RigidBody.js';

enum DirtyFlagBits {
    NONE = 0,
    SCALE = 1 << 0,
    ORIGIN = 1 << 1,
    ALL = 0xffffffff
}

const phys_vec3_a = new phys.Vec3;
const phys_transform_a = new phys.Transform;

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

    private _impl: phys.BoxShape;

    constructor(node: Node) {
        super(node);

        let body = this.node.getComponent(RigidBody);
        if (!body) {
            body = this.node.addComponent(RigidBody);
        }

        this._impl = new phys.BoxShape;
        body.impl.addShape(this._impl);

        this.body = body;
    }

    override update(): void {
        if (this.node.hasChangedFlag.hasBit(render.Transform.ChangeBit.SCALE)) {
            this._dirtyFlags |= DirtyFlagBits.SCALE;
        }

        if (this._dirtyFlags & DirtyFlagBits.SCALE) {
            const scale = vec3.multiply(vec3.create(), this._size, this.node.world_scale);
            phys_vec3_a.set(...scale);
            this._impl.scale = phys_vec3_a;
        }

        if (this._dirtyFlags & DirtyFlagBits.ORIGIN) {
            phys_vec3_a.set(...this._origin);
            phys_transform_a.identity();
            phys_transform_a.position = phys_vec3_a;
            const body = this.node.getComponent(RigidBody)!;
            body.impl.updateShapeTransform(this._impl, phys_transform_a);
        }

        this._dirtyFlags = DirtyFlagBits.NONE;
    }
}