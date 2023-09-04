import { Sampler, Texture, BlendFactor as gfx_BlendFactor, CullMode as gfx_CullMode, PrimitiveTopology as gfx_PrimitiveTopology, impl } from "gfx-main";
import { parse } from "yaml";
import { Asset } from "../core/Asset.js";
import { assetLib } from "../core/assetLib.js";
import { loader } from "../core/impl.js";
import { Pass as scene_Pass } from "../core/render/scene/Pass.js";
import { shaderLib } from "../core/shaderLib.js";
import { ShaderStages } from "./ShaderStages.js";

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

export type PrimitiveTopology = "LINE_LIST" | "TRIANGLE_LIST";

export interface RasterizationState {
    readonly cullMode: "NONE" | "FRONT" | "BACK";
}

export interface DepthStencilState {
    readonly depthTestEnable: boolean;
}

export type BlendFactor = "ZERO" | "ONE" | "SRC_ALPHA" | "ONE_MINUS_SRC_ALPHA" | "DST_ALPHA" | "ONE_MINUS_DST_ALPHA"

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
    readonly samplerTextures?: Record<string, [Texture, Sampler]>
    readonly primitive?: PrimitiveTopology;
    readonly rasterizationState?: RasterizationState;
    readonly depthStencilState?: DepthStencilState;
    readonly blendState?: BlendState;
}

function gfx_toBlendFactor(factor: BlendFactor): gfx_BlendFactor {
    switch (factor) {
        case 'ZERO':
            return gfx_BlendFactor.ZERO;
        case "ONE":
            return gfx_BlendFactor.ONE;
        case "SRC_ALPHA":
            return gfx_BlendFactor.SRC_ALPHA;
        case "ONE_MINUS_SRC_ALPHA":
            return gfx_BlendFactor.ONE_MINUS_SRC_ALPHA;
        case "DST_ALPHA":
            return gfx_BlendFactor.DST_ALPHA;
        case "ONE_MINUS_DST_ALPHA":
            return gfx_BlendFactor.ONE_MINUS_DST_ALPHA;
    }
}

export class Effect extends Asset {
    private _passes: Pass[] = [];
    // public get passes(): readonly PassInfo[] {
    //     return this._passes;
    // }

    async load(url: string): Promise<this> {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }

        const [, parent, name] = res;
        this._passes = parse(await loader.load(`${parent}/${name}.yml`, "text")).passes;
        return this;
    }

    async createPasses(overrides: Pass[]): Promise<scene_Pass[]> {
        const passes: scene_Pass[] = [];
        for (let i = 0; i < this._passes.length; i++) {
            const info = merge({}, this._passes[i], overrides[i]);
            if (info.switch && info.macros![info.switch] != 1) {
                continue;
            }

            const passState = new impl.PassState;
            passState.shader = shaderLib.getShader(await assetLib.load(info.shader!, ShaderStages), info.macros);
            switch (info.primitive) {
                case 'LINE_LIST':
                    passState.primitive = gfx_PrimitiveTopology.LINE_LIST
                    break;
                case 'TRIANGLE_LIST':
                    passState.primitive = gfx_PrimitiveTopology.TRIANGLE_LIST
                    break;
                default:
                    passState.primitive = gfx_PrimitiveTopology.TRIANGLE_LIST;
                    break;
            }
            const rasterizationState = new impl.RasterizationState;
            switch (info.rasterizationState?.cullMode) {
                case 'FRONT':
                    rasterizationState.cullMode = gfx_CullMode.FRONT;
                    break;
                case 'BACK':
                    rasterizationState.cullMode = gfx_CullMode.BACK;
                    break;
                default:
                    rasterizationState.cullMode = gfx_CullMode.BACK;
                    break;
            }
            passState.rasterizationState = rasterizationState;
            if (info.depthStencilState) {
                const depthStencilState = new impl.DepthStencilState;
                depthStencilState.depthTestEnable = info.depthStencilState.depthTestEnable;
                passState.depthStencilState = depthStencilState;
            }
            if (info.blendState) {
                const blendState = new impl.BlendState;
                blendState.srcRGB = gfx_toBlendFactor(info.blendState.srcRGB);
                blendState.dstRGB = gfx_toBlendFactor(info.blendState.dstRGB);
                blendState.srcAlpha = gfx_toBlendFactor(info.blendState.srcAlpha);
                blendState.dstAlpha = gfx_toBlendFactor(info.blendState.dstAlpha);
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