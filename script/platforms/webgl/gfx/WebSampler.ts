import { Filter, Sampler, SamplerInfo } from "../../../main/gfx/Sampler.js";

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

    private _sampler!: WebGLSampler;
    get sampler(): WebGLSampler {
        return this._sampler;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(info: SamplerInfo): boolean {
        const gl = this._gl;

        const sampler = gl.createSampler()!;
        gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, getFilter(info.magFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, getFilter(info.minFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, WebGL2RenderingContext.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, WebGL2RenderingContext.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, WebGL2RenderingContext.REPEAT);
        this._sampler = sampler;

        return false;
    }
}