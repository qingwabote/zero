import { DescriptorSet, DescriptorSetLayout } from "gfx";
import { AABB3D, aabb3d } from "../../math/aabb3d.js";
import { Material } from "./Material.js";
import { Mesh } from "./Mesh.js";
import { Transform } from "./Transform.js";
import { Transient } from "./Transient.js";

enum ChangeBits {
    NONE = 0,
    BOUNDS = 1 << 0,
}

type Store = {
    [index: number]: number;
    set(array: ArrayLike<number>, offset?: number): void;
}

export class Model {
    static readonly descriptorSetLayout?: DescriptorSetLayout = undefined;

    static readonly INSTANCE_STRIDE: number = 16;

    get descriptorSet(): DescriptorSet | undefined {
        return undefined;
    }

    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        return this._bounds;
    }

    private _hasOwnChanged = new Transient(ChangeBits.BOUNDS, ChangeBits.NONE);
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
        this._hasOwnChanged.value |= ChangeBits.BOUNDS;
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

    upload(out: Store, offset: number) {
        out.set(this._transform.world_matrix, offset);
    }
}
Model.ChangeBits = ChangeBits;

export declare namespace Model {
    export { ChangeBits }
}