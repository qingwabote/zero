import { cache } from "assets";
import { empty, murmurhash2_32_gc } from "bastard";
import * as gfx from "gfx";
import { hashLib } from "../core/render/hashLib.js";
import { shaderLib } from "../core/shaderLib.js";
import { Pass as _Pass } from "../scene/Pass.js";
import { Yml } from "./internal/Yml.js";
import { Shader } from "./Shader.js";
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
const getPass = (function () {
    const cache = {};
    return function (state, props = empty.obj, textures = empty.obj, type) {
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
            pass = new _Pass(state, type);
            for (const name in props) {
                pass.setProperty(props[name], pass.getPropertyOffset(name));
            }
            for (const name in textures) {
                pass.setTexture(name, textures[name].impl);
            }
            cache[passHash] = pass;
        }
        return pass;
    };
})();
export class Effect extends Yml {
    async onParse(res) {
        this._passes = res.passes;
    }
    async getPasses(overrides, macros = empty.obj) {
        const passes = [];
        for (let i = 0; i < this._passes.length; i++) {
            const info = merge({}, this._passes[i], overrides[i], { macros });
            if (info.switch && info.macros[info.switch] != 1) {
                continue;
            }
            const state = Object.assign(Object.assign({ shader: shaderLib.getShader(await cache(this.resolveVar(this.resolvePath(info.shader)), Shader), info.macros), rasterizationState: (function () {
                    var _a, _b;
                    const rasterization = new gfx.RasterizationState;
                    if ((_a = info.rasterizationState) === null || _a === void 0 ? void 0 : _a.cullMode) {
                        if (info.rasterizationState.cullMode in gfx.CullMode) {
                            rasterization.cullMode = gfx.CullMode[info.rasterizationState.cullMode];
                        }
                        else {
                            throw `unsupported cullMode: ${(_b = info.rasterizationState) === null || _b === void 0 ? void 0 : _b.cullMode}`;
                        }
                    }
                    else {
                        rasterization.cullMode = gfx.CullMode.BACK;
                    }
                    return rasterization;
                })() }, info.depthStencilState && {
                depthStencilState: (function () {
                    const depthStencil = new gfx.DepthStencilState;
                    depthStencil.depthTestEnable = info.depthStencilState.depthTestEnable;
                    return depthStencil;
                })()
            }), info.blendState && {
                blendState: (function () {
                    const blend = new gfx.BlendState;
                    blend.srcRGB = gfx_BlendFactor(info.blendState.srcRGB);
                    blend.dstRGB = gfx_BlendFactor(info.blendState.dstRGB);
                    blend.srcAlpha = gfx_BlendFactor(info.blendState.srcAlpha);
                    blend.dstAlpha = gfx_BlendFactor(info.blendState.dstAlpha);
                    return blend;
                })()
            });
            passes.push(getPass(state, info.props, info.textures, info.type));
        }
        return passes;
    }
}
