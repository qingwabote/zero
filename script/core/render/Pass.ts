import { DescriptorSet } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";

export default class Pass {
    private _shader: Shader;
    get shader(): Shader {
        return this._shader;
    }

    private _descriptorSet: DescriptorSet;
    get descriptorSet(): DescriptorSet {
        return this._descriptorSet;
    }

    constructor(shader: Shader) {
        this._shader = shader;
        this._descriptorSet = zero.device.createDescriptorSet();
        this._descriptorSet.initialize(this._shader.info.meta.descriptorSetLayout);
    }
}