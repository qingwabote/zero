import { cache } from "assets";
import * as gfx from "gfx";
import { Pass as scene_Pass } from "../core/render/scene/Pass.js";
import { shaderLib } from "../core/shaderLib.js";
import { Shader } from "./Shader.js";
import { Yml } from "./internal/Yml.js";

function merge<Out>(target: Out, ...sources: Out[]): Out {
    for (const source of sources) {
        for (const key in source) {
            if (target[key] != undefined && Object.getPrototypeOf(target[key]) == Object.prototype) {
                merge(target[key], source[key])
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

export interface RasterizationState {
    readonly cullMode: keyof typeof gfx.CullMode;
}

export interface DepthStencilState {
    readonly depthTestEnable: boolean;
}

export type BlendFactor = keyof typeof gfx.BlendFactor;

/**color(RGB) = (sourceColor * srcRGB) + (destinationColor * dstRGB)
 * color(A) = (sourceAlpha * srcAlpha) + (destinationAlpha * dstAlpha)
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFuncSeparate*/
export interface BlendState {
    readonly srcRGB: BlendFactor;
    readonly dstRGB: BlendFactor;
    readonly srcAlpha: BlendFactor;
    readonly dstAlpha: BlendFactor;
}

interface Pass {
    readonly switch?: string;
    readonly type?: string;
    readonly shader?: string;
    readonly macros?: Record<string, number>;
    readonly constants?: Record<string, ArrayLike<number>>;
    readonly samplerTextures?: Record<string, [gfx.Texture, gfx.Sampler]>
    readonly primitive?: keyof typeof gfx.PrimitiveTopology;
    readonly rasterizationState?: RasterizationState;
    readonly depthStencilState?: DepthStencilState;
    readonly blendState?: BlendState;
}

function gfx_BlendFactor(factor: BlendFactor): gfx.BlendFactor {
    if (factor in gfx.BlendFactor) {
        return gfx.BlendFactor[factor];
    }
    throw `unsupported factor: ${factor}`;
}

export class Effect extends Yml {
    private _passes: Pass[] = [];

    protected async onParse(res: any): Promise<void> {
        this._passes = res.passes;
    }

    async createPasses(overrides: Pass[]): Promise<scene_Pass[]> {
        const passes: scene_Pass[] = [];
        for (let i = 0; i < this._passes.length; i++) {
            const info = merge({}, this._passes[i], overrides[i]);
            if (info.switch && info.macros![info.switch] != 1) {
                continue;
            }

            const passState = new gfx.PassState;
            passState.shader = shaderLib.getShader(await cache(this.resolvePath(info.shader!), Shader), info.macros);

            if (info.primitive) {
                if (info.primitive in gfx.PrimitiveTopology) {
                    passState.primitive = gfx.PrimitiveTopology[info.primitive];
                } else {
                    throw `unsupported primitive: ${info.primitive}`;
                }
            } else {
                passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            }

            const rasterizationState = new gfx.RasterizationState;
            if (info.rasterizationState?.cullMode) {
                if (info.rasterizationState?.cullMode in gfx.CullMode) {
                    rasterizationState.cullMode = gfx.CullMode[info.rasterizationState?.cullMode];
                } else {
                    throw `unsupported cullMode: ${info.rasterizationState?.cullMode}`;
                }
            } else {
                rasterizationState.cullMode = gfx.CullMode.BACK;
            }

            passState.rasterizationState = rasterizationState;
            if (info.depthStencilState) {
                const depthStencilState = new gfx.DepthStencilState;
                depthStencilState.depthTestEnable = info.depthStencilState.depthTestEnable;
                passState.depthStencilState = depthStencilState;
            }
            if (info.blendState) {
                const blendState = new gfx.BlendState;
                blendState.srcRGB = gfx_BlendFactor(info.blendState.srcRGB);
                blendState.dstRGB = gfx_BlendFactor(info.blendState.dstRGB);
                blendState.srcAlpha = gfx_BlendFactor(info.blendState.srcAlpha);
                blendState.dstAlpha = gfx_BlendFactor(info.blendState.dstAlpha);
                passState.blendState = blendState;
            }

            const pass = new scene_Pass(passState, info.type);
            for (const key in info.constants) {
                pass.setUniform('Constants', key, info.constants[key]);
            }
            for (const key in info.samplerTextures) {
                pass.setTexture(key, ...info.samplerTextures[key]);
            }
            passes.push(pass);
        }
        return passes;
    }
}