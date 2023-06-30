import SmartRef from "../../../main/base/SmartRef.js";
import { Sampler } from "../../../main/core/gfx/Sampler.js";
import { Filter, SamplerInfo } from "../../../main/core/gfx/info.js";

function getFilter(val: Filter): GLenum {
    switch (val) {
        case Filter.NEAREST:
            return WebGL2RenderingContext.NEAREST;
        case Filter.LINEAR:
            return WebGL2RenderingContext.LINEAR;
    }
}

export default class WebSampler implements Sampler {
    private _gl: WebGL2RenderingContext;

    private _impl!: SmartRef<WebGLSampler>;
    get impl(): SmartRef<WebGLSampler> {
        return this._impl;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(info: SamplerInfo): boolean {
        const gl = this._gl;

        const sampler = new SmartRef(gl.createSampler()!, gl.deleteSampler, gl);
        gl.samplerParameteri(sampler.deref(), gl.TEXTURE_MIN_FILTER, getFilter(info.magFilter));
        gl.samplerParameteri(sampler.deref(), gl.TEXTURE_MAG_FILTER, getFilter(info.minFilter));
        gl.samplerParameteri(sampler.deref(), gl.TEXTURE_WRAP_S, WebGL2RenderingContext.REPEAT);
        gl.samplerParameteri(sampler.deref(), gl.TEXTURE_WRAP_T, WebGL2RenderingContext.REPEAT);
        gl.samplerParameteri(sampler.deref(), gl.TEXTURE_WRAP_R, WebGL2RenderingContext.REPEAT);
        this._impl = sampler;

        return false;
    }
}