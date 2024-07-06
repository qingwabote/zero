import { cache } from "assets";
import { empty, murmurhash2_32_gc } from "bastard";
import * as gfx from "gfx";
import { hashLib } from "../core/render/hashLib.js";
import * as render from "../core/render/index.js";
import { shaderLib } from "../core/shaderLib.js";
import { Yml } from "./internal/Yml.js";
import { Shader } from "./Shader.js";
import { Texture } from "./Texture.js";

function merge<T extends {}, U>(target: T, source: U): T & U;
function merge<T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
function merge<T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
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

type MacroRecord = Record<string, number>;
type PropRecord = Record<string, ArrayLike<number>>;

interface Pass {
    switch?: string;
    type?: string;

    shader?: string;
    macros?: MacroRecord;
    rasterizationState?: RasterizationState;
    depthStencilState?: DepthStencilState;
    blendState?: BlendState;

    props?: PropRecord;
}

type TextureRecord = Record<string, Texture>;

interface PassOverridden extends Pass {
    textures?: TextureRecord;
}

function gfx_BlendFactor(factor: BlendFactor): gfx.BlendFactor {
    if (factor in gfx.BlendFactor) {
        return gfx.BlendFactor[factor];
    }
    throw `unsupported factor: ${factor}`;
}

const getPass = (function () {
    const cache: Record<number, render.Pass> = {};

    return function (state: render.Pass.State, props: PropRecord = empty.obj, textures: TextureRecord = empty.obj, type?: string) {
        let key = `${type}`;
        for (const name in props) {
            key += name;
            const prop = props[name];
            for (let i = 0; i < prop.length; i++) {
                key += prop[i];
            }
        }
        for (const name in textures) {
            key += name + textures[name].url;
        }

        const passHash = hashLib.passState(state) ^ murmurhash2_32_gc(key, 666);

        let pass = cache[passHash];
        if (!pass) {
            pass = render.Pass.Pass(state, type);
            for (const name in props) {
                pass.setProperty(props[name], pass.getPropertyOffset(name));
            }
            for (const name in textures) {
                pass.setTexture(name, textures[name].impl);
            }

            cache[passHash] = pass;
        }

        return pass;
    }
})()

export class Effect extends Yml {
    private _passes!: readonly Readonly<Pass>[];

    protected async onParse(res: any): Promise<void> {
        this._passes = res.passes;
    }

    async getPasses(overrides: readonly Readonly<PassOverridden>[], macros: MacroRecord = empty.obj): Promise<render.Pass[]> {
        const passes: render.Pass[] = [];
        for (let i = 0; i < this._passes.length; i++) {
            const info = merge({}, this._passes[i], overrides[i], { macros });
            if (info.switch && info.macros[info.switch] != 1) {
                continue;
            }

            const state: render.Pass.State = {
                shader: shaderLib.getShader(await cache(this.resolveVar(this.resolvePath(info.shader!)), Shader), info.macros),
                rasterizationState: (function () {
                    const rasterization = new gfx.RasterizationState;
                    if (info.rasterizationState?.cullMode) {
                        if (info.rasterizationState.cullMode in gfx.CullMode) {
                            rasterization.cullMode = gfx.CullMode[info.rasterizationState.cullMode];
                        } else {
                            throw `unsupported cullMode: ${info.rasterizationState?.cullMode}`;
                        }
                    } else {
                        rasterization.cullMode = gfx.CullMode.BACK;
                    }
                    return rasterization
                })(),
                ...info.depthStencilState && {
                    depthStencilState: (function () {
                        const depthStencil = new gfx.DepthStencilState;
                        depthStencil.depthTestEnable = info.depthStencilState.depthTestEnable;
                        return depthStencil
                    })()
                },
                ...info.blendState && {
                    blendState: (function () {
                        const blend = new gfx.BlendState;
                        blend.srcRGB = gfx_BlendFactor(info.blendState.srcRGB);
                        blend.dstRGB = gfx_BlendFactor(info.blendState.dstRGB);
                        blend.srcAlpha = gfx_BlendFactor(info.blendState.srcAlpha);
                        blend.dstAlpha = gfx_BlendFactor(info.blendState.dstAlpha);
                        return blend;
                    })()
                }
            }

            passes.push(getPass(state, info.props, info.textures, info.type));
        }
        return passes;
    }
}

export declare namespace Effect {
    export { RasterizationState, DepthStencilState, BlendFactor, BlendState, Pass, PassOverridden }
}