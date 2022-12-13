import DescriptorSet from "../gfx/DescriptorSet.js";
import { BlendFactor, BlendState, CullMode, RasterizationState } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";
import PassPhase from "./PassPhase.js";

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

    private _blendState: BlendState;
    get blendState(): BlendState {
        return this._blendState;
    }

    private _phase: PassPhase;
    get phase(): PassPhase {
        return this._phase;
    }

    private _hash: string;
    get hash(): string {
        return this._hash;
    }

    constructor(
        descriptorSet: DescriptorSet,
        shader: Shader,
        rasterizationState: RasterizationState = { cullMode: CullMode.BACK },
        blendState: BlendState = { enabled: true, srcRGB: BlendFactor.SRC_ALPHA, dstRGB: BlendFactor.ONE_MINUS_SRC_ALPHA, srcAlpha: BlendFactor.ONE, dstAlpha: BlendFactor.ONE_MINUS_SRC_ALPHA },
        phase: PassPhase = PassPhase.DEFAULT
    ) {

        this._descriptorSet = descriptorSet;

        this._hash = shader.info.hash;
        this._hash += `${rasterizationState.cullMode}`;
        this._hash += `${blendState.enabled}${blendState.srcRGB}${blendState.dstRGB}${blendState.srcAlpha}${blendState.dstAlpha}`;

        this._shader = shader;
        this._rasterizationState = rasterizationState;
        this._blendState = blendState;
        this._phase = phase;
    }
}