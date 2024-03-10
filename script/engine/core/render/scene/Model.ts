import { device } from "boot";
import { BufferUsageFlagBits, DescriptorSet } from "gfx";
import { AABB3D, aabb3d } from "../../math/aabb3d.js";
import { mat4 } from "../../math/mat4.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";
import { Material } from "./Material.js";
import { Mesh } from "./Mesh.js";
import { Transform } from "./Transform.js";

const NULL_MATERIALS: readonly Material[] = Object.freeze([]);

export class Model {
    static readonly descriptorSetLayout = (function () {
        const layout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Local]);
        (layout as any).name = "Model descriptorSetLayout";
        return layout;
    })();

    private _localBuffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Local.length);
    private _localBuffer_invalid = false;

    protected _transform!: Transform;
    public get transform(): Transform {
        return this._transform;
    }
    public set transform(value: Transform) {
        this._transform = value;
        this._localBuffer_invalid = true;
    }

    private _world_bounds_invalid = false;
    private _world_bounds = aabb3d.create();
    public get world_bounds(): Readonly<AABB3D> {
        if (this._world_bounds_invalid) {
            aabb3d.transform(this._world_bounds, this.mesh.bounds, this._transform.world_matrix);
            this._world_bounds_invalid = false;
        }
        return this._world_bounds;
    }

    private _mesh = Mesh.NULL;
    public get mesh() {
        return this._mesh;
    }
    public set mesh(value) {
        this._mesh = value;
        this._world_bounds_invalid = true;
    }

    materials = NULL_MATERIALS;

    type: string = 'default';

    order: number = 0;

    readonly descriptorSet: DescriptorSet;

    constructor() {
        const ModelType = (this.constructor as typeof Model);
        const descriptorSet = device.createDescriptorSet(ModelType.descriptorSetLayout);
        descriptorSet.bindBuffer(shaderLib.sets.local.uniforms.Local.binding, this._localBuffer.buffer);
        this.descriptorSet = descriptorSet;
    }

    onAddToScene() {
        this._localBuffer_invalid = true;
    }

    update() {
        if (this._mesh.hasChanged) {
            this._world_bounds_invalid = true;
        }

        if (this._transform.hasChanged) {
            this._world_bounds_invalid = this._localBuffer_invalid = true;
        }

        if (this._localBuffer_invalid) {
            this._localBuffer.set(this._transform.world_matrix);
            // http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ or https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html
            this._localBuffer.set(mat4.inverseTranspose(mat4.create(), this._transform.world_matrix), 16);
            this._localBuffer.update();
            this._localBuffer_invalid = false;
        }

        for (const material of this.materials) {
            for (const pass of material.passes) {
                pass.update();
            }
        }
    }
}