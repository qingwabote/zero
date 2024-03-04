import { cache } from "assets";
import * as gfx from "gfx";
import { render } from "../core/index.js";
import { shaderLib } from "../core/shaderLib.js";
import { Shader } from "./Shader.js";
import { Yml } from "./internal/Yml.js";
function merge(target, ...sources) {
    for (const source of sources) {
        for (const key in source) {
            if (target[key] != undefined && Object.getPrototypeOf(target[key]) == Object.prototype) {
                merge(target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
    }
    return target;
}
function gfx_BlendFactor(factor) {
    if (factor in gfx.BlendFactor) {
        return gfx.BlendFactor[factor];
    }
    throw `unsupported factor: ${factor}`;
}
export class Effect extends Yml {
    async onParse(res) {
        this._passes = res.passes;
    }
    async createPasses(overrides = []) {
        var _a, _b, _c, _d, _e;
        const passes = [];
        for (let i = 0; i < this._passes.length; i++) {
            const info = merge({}, this._passes[i], overrides[i]);
            if (info.switch && ((_a = info.macros) === null || _a === void 0 ? void 0 : _a[info.switch]) != 1) {
                continue;
            }
            const passState = new gfx.PassState;
            passState.shader = shaderLib.getShader(await cache(this.resolveVar(this.resolvePath(info.shader)), Shader), info.macros);
            if (info.primitive) {
                if (info.primitive in gfx.PrimitiveTopology) {
                    passState.primitive = gfx.PrimitiveTopology[info.primitive];
                }
                else {
                    throw `unsupported primitive: ${info.primitive}`;
                }
            }
            else {
                passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            }
            const rasterizationState = new gfx.RasterizationState;
            if ((_b = info.rasterizationState) === null || _b === void 0 ? void 0 : _b.cullMode) {
                if (((_c = info.rasterizationState) === null || _c === void 0 ? void 0 : _c.cullMode) in gfx.CullMode) {
                    rasterizationState.cullMode = gfx.CullMode[(_d = info.rasterizationState) === null || _d === void 0 ? void 0 : _d.cullMode];
                }
                else {
                    throw `unsupported cullMode: ${(_e = info.rasterizationState) === null || _e === void 0 ? void 0 : _e.cullMode}`;
                }
            }
            else {
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
            const pass = new render.Pass(passState, info.type);
            pass.initialize();
            for (const key in info.props) {
                pass.setUniform('Props', key, info.props[key]);
            }
            for (const key in info.textures) {
                pass.setTexture(key, info.textures[key]);
            }
            passes.push(pass);
        }
        return passes;
    }
}
