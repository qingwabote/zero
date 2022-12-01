import { CullMode, DescriptorSet, RasterizationState } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";
import { PhaseBit } from "../pipeline/RenderPhase.js";

export default class Pass {
    private _descriptorSet: DescriptorSet;
    get descriptorSet(): DescriptorSet {
        return this._descriptorSet;
    }

    private _shader: Shader;
    get shader(): Shader {
        return this._shader;
    }

    private _rasterizationState: RasterizationState;
    get rasterizationState(): RasterizationState {
        return this._rasterizationState;
    }

    private _phase: PhaseBit;
    get phase(): PhaseBit {
        return this._phase;
    }

    private _hash: string;
    get hash(): string {
        return this._hash;
    }

    constructor(descriptorSet: DescriptorSet, shader: Shader, rasterizationState: RasterizationState = { cullMode: CullMode.BACK, hash: CullMode.BACK.toString() }, phase: PhaseBit = PhaseBit.DEFAULT) {
        this._descriptorSet = descriptorSet;

        this._hash = shader.info.hash + rasterizationState.hash;

        this._shader = shader;
        this._rasterizationState = rasterizationState;
        this._phase = phase;
    }
}