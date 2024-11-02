import { BufferUsageFlagBits, DescriptorSet, Format } from "gfx";
import { AABB3D, aabb3d } from "../../math/aabb3d.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../gpu/BufferView.js";
import { MemoryView } from "../gpu/MemoryView.js";
import { Material } from "./Material.js";
import { Mesh } from "./Mesh.js";
import { PeriodicFlag } from "./PeriodicFlag.js";
import { Transform } from "./Transform.js";

interface InstancedAttribute {
    readonly location: number
    readonly format: Format
    readonly offset: number
    readonly multiple: number
}

interface InstancedBatchInfo {
    readonly attributes: readonly InstancedAttribute[],
    readonly vertexes: BufferView;
    readonly descriptorSet?: DescriptorSet;
    readonly uniforms?: Record<string, MemoryView>;
}

const instancedAttributes = [{ location: shaderLib.attributes.model.location, format: Format.RGBA32_SFLOAT, offset: 0, multiple: 4 }];

enum ChangeBits {
    NONE = 0,
    BOUNDS = 1 << 0,
}

export class Model {
    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        return this._bounds;
    }

    private _hasOwnChanged = new PeriodicFlag(ChangeBits.BOUNDS);
    get hasChanged(): number {
        let flag = this._hasOwnChanged.value;
        if (this._mesh.hasChanged || this._transform.hasChangedFlag.value) {
            flag |= ChangeBits.BOUNDS;
        }
        return flag;
    }

    public get transform(): Transform {
        return this._transform;
    }

    public get mesh() {
        return this._mesh;
    }
    public set mesh(value) {
        this._mesh = value;
        this._hasOwnChanged.addBit(ChangeBits.BOUNDS)
    }

    type: string = 'default';

    /**
     * Draw order
     */
    order: number = 0;

    constructor(private _transform: Transform, private _mesh: Mesh, public materials: readonly Material[]) { }

    updateBounds() {
        aabb3d.transform(this._bounds, this._mesh.bounds, this._transform.world_matrix);
    }

    batch(): InstancedBatchInfo {
        return { attributes: instancedAttributes, vertexes: new BufferView('Float32', BufferUsageFlagBits.VERTEX) }
    }

    batchFill(vertexes: BufferView, uniforms?: Record<string, MemoryView>) {
        vertexes.add(this._transform.world_matrix)
    }
}
Model.ChangeBits = ChangeBits;

export declare namespace Model {
    export { ChangeBits, InstancedBatchInfo }
}