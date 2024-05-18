import { DescriptorSet, DescriptorSetLayout } from "gfx";
import { AABB3D, aabb3d } from "../../math/aabb3d.js";
import { BufferView } from "../BufferView.js";
import { UniformSource } from "../UniformSource.js";
import { ChangeRecord } from "./ChangeRecord.js";
import { Material } from "./Material.js";
import { Mesh } from "./Mesh.js";
import { Transform } from "./Transform.js";

enum ChangeBits {
    NONE = 0,
    BOUNDS = 1 << 0,
}

export class Model extends ChangeRecord implements UniformSource {
    private _bounds_invalidated = true;
    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        if (this._bounds_invalidated) {
            aabb3d.transform(this._bounds, this.mesh.bounds, this._transform.world_matrix);
            this._bounds_invalidated = false;
        }
        return this._bounds;
    }

    private _localBuffer_invalidated = false;

    public get transform(): Transform {
        return this._transform;
    }
    public set transform(value: Transform) {
        this._transform = value;
        this._localBuffer_invalidated = true;
        super.hasChanged |= ChangeBits.BOUNDS;
    }

    public get mesh() {
        return this._mesh;
    }
    public set mesh(value) {
        this._mesh = value;
        this._bounds_invalidated = true;
        super.hasChanged |= ChangeBits.BOUNDS;
    }

    override get hasChanged(): number {
        let flags = super.hasChanged;
        if (this._mesh.hasChanged || this._transform.hasChanged) {
            flags |= ChangeBits.BOUNDS;
        }
        return flags;
    }

    type: string = 'default';

    order: number = 0;

    constructor(private _transform: Transform, private _mesh: Mesh, public materials: readonly Material[]) {
        super(ChangeBits.BOUNDS);
    }

    update() {
        if (this._mesh.hasChanged) {
            this._bounds_invalidated = true;
        }

        if (this._transform.hasChanged) {
            this._bounds_invalidated = this._localBuffer_invalidated = true;
        }
    }

    getDescriptorSetLayout(): DescriptorSetLayout | null { return null; }

    createUniformBuffers(descriptorSet: DescriptorSet): BufferView[] { return []; }

    fillBuffers(buffers: BufferView[]) { }
}
Model.ChangeBits = ChangeBits;

export declare namespace Model {
    export { ChangeBits }
}