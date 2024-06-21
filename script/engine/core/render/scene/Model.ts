import { device } from "boot";
import { DescriptorSet, DescriptorSetLayout } from "gfx";
import { AABB3D, aabb3d } from "../../math/aabb3d.js";
import { shaderLib } from "../../shaderLib.js";
import { Material } from "./Material.js";
import { Mesh } from "./Mesh.js";
import { PeriodicFlag } from "./PeriodicFlag.js";
import { Transform } from "./Transform.js";

enum ChangeBits {
    NONE = 0,
    BOUNDS = 1 << 0,
}

export class Model {
    static readonly descriptorSetLayout: DescriptorSetLayout = shaderLib.createDescriptorSetLayout([]);

    private _bounds_invalidated = true;
    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        if (this._bounds_invalidated) {
            aabb3d.transform(this._bounds, this.mesh.bounds, this._transform.world_matrix);
            this._bounds_invalidated = false;
        }
        return this._bounds;
    }

    private _hasChanged = new PeriodicFlag(ChangeBits.BOUNDS);
    get hasChanged(): number {
        let flag = this._hasChanged.value;
        if (this._mesh.hasChanged || this._transform.hasChangedFlag.value) {
            flag |= ChangeBits.BOUNDS;
        }
        return flag;
    }

    public get transform(): Transform {
        return this._transform;
    }
    public set transform(value: Transform) {
        this._transform = value;
        this._hasChanged.addBit(ChangeBits.BOUNDS)
    }

    public get mesh() {
        return this._mesh;
    }
    public set mesh(value) {
        this._mesh = value;
        this._bounds_invalidated = true;
        this._hasChanged.addBit(ChangeBits.BOUNDS)
    }

    type: string = 'default';

    order: number = 0;

    get descriptorSetLayout(): DescriptorSetLayout {
        return (this.constructor as typeof Model).descriptorSetLayout;
    }

    readonly descriptorSet?: DescriptorSet;

    protected _hasUploadedFlag = new PeriodicFlag;

    constructor(private _transform: Transform, private _mesh: Mesh, public materials: readonly Material[]) {
        const descriptorSetLayout = (this.constructor as typeof Model).descriptorSetLayout;
        if (descriptorSetLayout.info.bindings.size()) {
            this.descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        }
    }

    update() {
        if (this._mesh.hasChanged || this._transform.hasChangedFlag.value) {
            this._bounds_invalidated = true;
        }
    }

    upload() {
        if (this._hasUploadedFlag.value) {
            return;
        }

        this._hasUploadedFlag.reset(1);
    }
}
Model.ChangeBits = ChangeBits;

export declare namespace Model {
    export { ChangeBits }
}