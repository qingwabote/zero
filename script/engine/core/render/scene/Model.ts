import { device } from "boot";
import { BufferUsageFlagBits, DescriptorSet } from "gfx";
import { AABB3D, aabb3d } from "../../math/aabb3d.js";
import { mat4 } from "../../math/mat4.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";
import { ChangeRecord } from "./ChangeRecord.js";
import { Material } from "./Material.js";
import { Mesh } from "./Mesh.js";
import { Transform } from "./Transform.js";

const mat4_a = mat4.create();

enum ChangeBits {
    NONE = 0,
    BOUNDS = 1 << 0,
    UPLOAD = 1 << 1,
}

export class Model extends ChangeRecord {
    static readonly descriptorSetLayout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Local]);

    static readonly ChangeBits = ChangeBits;

    readonly descriptorSet: DescriptorSet;

    private _bounds_invalidated = true;
    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        if (this._bounds_invalidated) {
            aabb3d.transform(this._bounds, this.mesh.bounds, this._transform.world_matrix);
            this._bounds_invalidated = false;
        }
        return this._bounds;
    }

    private _localBuffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Local.length);
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
        const descriptorSet = device.createDescriptorSet((this.constructor as typeof Model).descriptorSetLayout);
        descriptorSet.bindBuffer(shaderLib.sets.local.uniforms.Local.binding, this._localBuffer.buffer);
        this.descriptorSet = descriptorSet;
    }

    update() {
        if (this._mesh.hasChanged) {
            this._bounds_invalidated = true;
        }

        if (this._transform.hasChanged) {
            this._bounds_invalidated = this._localBuffer_invalidated = true;
        }
    }

    upload() {
        if (this._localBuffer_invalidated) {
            this._localBuffer.set(this._transform.world_matrix);
            // http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ or https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html
            this._localBuffer.set(mat4.inverseTranspose(mat4_a, this._transform.world_matrix), 16);
            this._localBuffer.update();
            this._localBuffer_invalidated = false;
        }

        for (const material of this.materials) {
            for (const pass of material.passes) {
                pass.update();
            }
        }

        super.hasChanged |= ChangeBits.UPLOAD;
    }
}