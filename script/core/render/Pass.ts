import DescriptorSet from "../gfx/DescriptorSet.js";
import { BlendFactor, BlendState, CullMode, DepthStencilState, PrimitiveTopology, RasterizationState } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";
import PassPhase from "./PassPhase.js";

export default class Pass {
    private _descriptorSet?: DescriptorSet;
    get descriptorSet(): DescriptorSet | undefined {
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

    private _depthStencilState: DepthStencilState;
    get depthStencilState(): DepthStencilState {
        return this._depthStencilState;
    }

    private _blendState: BlendState;
    get blendState(): BlendState {
        return this._blendState;
    }

    readonly primitive: PrimitiveTopology;

    private _phase: PassPhase;
    get phase(): PassPhase {
        return this._phase;
    }

    private _hash: string;
    get hash(): string {
        return this._hash;
    }

    constructor(
        shader: Shader,
        descriptorSet?: DescriptorSet,
        rasterizationState: RasterizationState = { cullMode: CullMode.BACK },
        depthStencilState: DepthStencilState = { depthTestEnable: true },
        blendState: BlendState = { enabled: true, srcRGB: BlendFactor.SRC_ALPHA, dstRGB: BlendFactor.ONE_MINUS_SRC_ALPHA, srcAlpha: BlendFactor.ONE, dstAlpha: BlendFactor.ONE_MINUS_SRC_ALPHA },
        primitive: PrimitiveTopology = PrimitiveTopology.TRIANGLE_LIST,
        phase: PassPhase = PassPhase.DEFAULT
    ) {
        this._hash = shader.info.hash;
        this._hash += `${rasterizationState.cullMode}`;
        this._hash += `${depthStencilState.depthTestEnable}`;
        this._hash += `${blendState.enabled}${blendState.srcRGB}${blendState.dstRGB}${blendState.srcAlpha}${blendState.dstAlpha}`;
        this._hash += `${primitive}`;

        this._shader = shader;
        this._descriptorSet = descriptorSet;
        this._rasterizationState = rasterizationState;
        this._depthStencilState = depthStencilState;
        this._blendState = blendState;
        this.primitive = primitive;
        this._phase = phase;
    }
}