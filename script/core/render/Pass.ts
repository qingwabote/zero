import { DescriptorSet } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";

export enum PassPhase {
    DEFAULT = 0,
    SHADOWMAP = 1
}

export default class Pass {
    private _shader: Shader;
    get shader(): Shader {
        return this._shader;
    }

    private _phase: PassPhase;
    get phase(): PassPhase {
        return this._phase;
    }

    private _descriptorSet: DescriptorSet;
    get descriptorSet(): DescriptorSet {
        return this._descriptorSet;
    }

    constructor(shader: Shader, phase: PassPhase = PassPhase.DEFAULT) {
        this._shader = shader;
        this._phase = phase;
        const descriptorSet = gfx.createDescriptorSet();
        if (descriptorSet.initialize(this._shader.info.meta.descriptorSetLayout)) {
            throw new Error("descriptorSet initialize failed");
        }
        this._descriptorSet = descriptorSet;
    }
}