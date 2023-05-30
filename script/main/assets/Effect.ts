import { parse } from "yaml";
import Asset from "../core/Asset.js";
import { BlendState, DepthStencilState, PassState, PrimitiveTopology, RasterizationState } from "../core/gfx/Pipeline.js";
import { Sampler } from "../core/gfx/Sampler.js";
import Texture from "../core/gfx/Texture.js";
import programLib from "../core/programLib.js";
import Pass from "../core/scene/Pass.js";

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

export interface PassInfo {
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

export default class Effect extends Asset {
    private _passes: PassInfo[] = [];
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

    async createPasses(overrides: PassInfo[]): Promise<Pass[]> {
        const passes: Pass[] = [];
        for (let i = 0; i < this._passes.length; i++) {
            const info = merge({}, this._passes[i], overrides[i]);
            const shader = await programLib.loadShader({ name: info.shader!, macros: info.macros });
            const pass = new Pass(new PassState(shader, info.primitive, info.rasterizationState, info.depthStencilState, info.blendState), info.type);
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