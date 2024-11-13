import { DescriptorSet, Format } from "gfx";
import { AABB3D, aabb3d } from "../../math/aabb3d.js";
import { shaderLib } from "../../shaderLib.js";
import { MemoryView } from "../gpu/MemoryView.js";
import { Material } from "./Material.js";
import { Mesh } from "./Mesh.js";
import { Periodic } from "./Periodic.js";
import { Transform } from "./Transform.js";

interface InstancedAttribute {
    readonly location: number
    readonly format: Format
    readonly multiple?: number
}

const a_model: InstancedAttribute = { location: shaderLib.attributes.model.location, format: Format.RGBA32_SFLOAT, multiple: 4 }

enum ChangeBits {
    NONE = 0,
    BOUNDS = 1 << 0,
}

export class Model {
    static readonly a_model = a_model;

    static readonly attributes: readonly InstancedAttribute[] = [a_model];

    get descriptorSet(): DescriptorSet | undefined {
        return undefined;
    }

    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        return this._bounds;
    }

    private _hasOwnChanged = new Periodic(ChangeBits.BOUNDS, ChangeBits.NONE);
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

    upload(attributes: Readonly<Record<string, MemoryView>>) {
        attributes[a_model.location].add(this._transform.world_matrix)
    }
}
Model.ChangeBits = ChangeBits;

export declare namespace Model {
    export { InstancedAttribute, ChangeBits }
}