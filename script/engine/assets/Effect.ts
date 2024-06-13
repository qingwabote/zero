import { cache } from "assets";
import * as gfx from "gfx";
import * as render from "../core/render/index.js";
import { shaderLib } from "../core/shaderLib.js";
import { Shader } from "./Shader.js";
import { Yml } from "./internal/Yml.js";

function merge<T extends {}, U>(target: T, source: U): T & U;
function merge<T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
function merge(target: any, ...sources: any[]): any {
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

interface RasterizationState {
    readonly cullMode: keyof typeof gfx.CullMode;
}

interface DepthStencilState {
    readonly depthTestEnable: boolean;
}

type BlendFactor = keyof typeof gfx.BlendFactor;

/**color(RGB) = (sourceColor * srcRGB) + (destinationColor * dstRGB)
 * color(A) = (sourceAlpha * srcAlpha) + (destinationAlpha * dstAlpha)
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFuncSeparate*/
interface BlendState {
    readonly srcRGB: BlendFactor;
    readonly dstRGB: BlendFactor;
    readonly srcAlpha: BlendFactor;
    readonly dstAlpha: BlendFactor;
}

interface Pass {
    switch?: string;
    type?: string;
    shader?: string;
    macros?: Record<string, number>;
    props?: Record<string, ArrayLike<number>>;
    primitive?: keyof typeof gfx.PrimitiveTopology;
    rasterizationState?: RasterizationState;
    depthStencilState?: DepthStencilState;
    blendState?: BlendState;
}

interface PassOverridden extends Pass {
    textures?: Record<string, gfx.Texture>;
}

function gfx_BlendFactor(factor: BlendFactor): gfx.BlendFactor {
    if (factor in gfx.BlendFactor) {
        return gfx.BlendFactor[factor];
    }
    throw `unsupported factor: ${factor}`;
}

export class Effect extends Yml {
    private _passes!: readonly Readonly<Pass>[];

    protected async onParse(res: any): Promise<void> {
        this._passes = res.passes;
    }

    async createPasses(overrides: readonly Readonly<PassOverridden>[], macros?: Record<string, number>): Promise<render.Pass[]> {
        const passes: render.Pass[] = [];
        for (let i = 0; i < this._passes.length; i++) {
            const info = merge({}, this._passes[i], overrides[i]);
            const mac = Object.assign({}, info.macros, macros);
            if (info.switch && mac[info.switch] != 1) {
                continue;
            }

            const passState = new gfx.PassState;
            passState.shader = shaderLib.getShader(await cache(this.resolveVar(this.resolvePath(info.shader!)), Shader), mac);

            if (info.primitive) {
                if (info.primitive in gfx.PrimitiveTopology) {
                    passState.primitive = gfx.PrimitiveTopology[info.primitive];
                } else {
                    throw `unsupported primitive: ${info.primitive}`;
                }
            } else {
                passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            }

            if (info.rasterizationState?.cullMode) {
                if (info.rasterizationState?.cullMode in gfx.CullMode) {
                    passState.rasterizationState.cullMode = gfx.CullMode[info.rasterizationState?.cullMode];
                } else {
                    throw `unsupported cullMode: ${info.rasterizationState?.cullMode}`;
                }
            } else {
                passState.rasterizationState.cullMode = gfx.CullMode.BACK;
            }

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

            const pass = render.Pass.Pass(passState, info.type);
            for (const key in info.props) {
                pass.setProperty(key, info.props[key]);
            }
            for (const key in info.textures) {
                pass.setTexture(key, info.textures[key]);
            }
            passes.push(pass);
        }
        return passes;
    }
}

export declare namespace Effect {
    export { RasterizationState, DepthStencilState, BlendFactor, BlendState, Pass, PassOverridden }
}