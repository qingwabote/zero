import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import mat4, { Mat4 } from "../math/mat4.js";
import ShaderLib from "../ShaderLib.js";
import BufferView from "./buffers/BufferView.js";
import FrameDirtyRecord from "./FrameDirtyRecord.js";
import SubModel from "./SubModel.js";

enum DirtyFlag {
    NONE = 0,
    MATRIX = 1 << 0,
    ALL = 0xffffffff
}

export default class Model extends FrameDirtyRecord {

    visibilityFlag = 0;

    private _matrix: Readonly<Mat4> = mat4.IDENTITY;
    public get matrix(): Readonly<Mat4> {
        return this._matrix;
    }
    public set matrix(value: Readonly<Mat4>) {
        this._matrix = value;
        this.hasChanged |= DirtyFlag.MATRIX;
    }

    private _bufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShaderLib.sets.local.uniforms.Local.length);

    readonly descriptorSet: DescriptorSet;

    constructor(readonly subModels: SubModel[]) {
        super();
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ShaderLib.builtinDescriptorSetLayouts.local)
        descriptorSet.bindBuffer(ShaderLib.sets.local.uniforms.Local.binding, this._bufferView.buffer);
        this.descriptorSet = descriptorSet;
    }

    update() {
        this._bufferView.set(this._matrix);
        this._bufferView.set(mat4.inverseTranspose(mat4.create(), this._matrix), 16);
        this._bufferView.update();

        for (const subModel of this.subModels) {
            for (const pass of subModel.passes) {
                pass.update();
            }
        }
    }
}