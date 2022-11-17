import { CullMode, DescriptorSet, RasterizationState } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";
import shaders from "../shaders.js";

export enum PassPhase {
    DEFAULT = 0,
    SHADOWMAP = 1
}

export default class Pass {
    private _shader: Shader;
    get shader(): Shader {
        return this._shader;
    }

    private _rasterizationState: RasterizationState;
    get rasterizationState(): RasterizationState {
        return this._rasterizationState;
    }

    private _phase: PassPhase;
    get phase(): PassPhase {
        return this._phase;
    }

    private _descriptorSet: DescriptorSet;
    get descriptorSet(): DescriptorSet {
        return this._descriptorSet;
    }

    private _hash: string;
    get hash(): string {
        return this._hash;
    }

    constructor(shader: Shader, rasterizationState: RasterizationState = { cullMode: CullMode.BACK, hash: CullMode.BACK.toString() }, phase: PassPhase = PassPhase.DEFAULT) {
        this._hash = shader.info.hash + rasterizationState.hash;

        this._shader = shader;
        this._rasterizationState = rasterizationState;
        this._phase = phase;
        const descriptorSet = gfx.createDescriptorSet();
        if (descriptorSet.initialize(shaders.getDescriptorSetLayout(shader))) {
            throw new Error("descriptorSet initialize failed");
        }
        this._descriptorSet = descriptorSet;
    }
}