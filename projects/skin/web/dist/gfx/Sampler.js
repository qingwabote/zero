import { Filter } from 'gfx-common';
function getFilter(val) {
    switch (val) {
        case Filter.NEAREST:
            return WebGL2RenderingContext.NEAREST;
        case Filter.LINEAR:
            return WebGL2RenderingContext.LINEAR;
    }
}
export class Sampler {
    get impl() {
        return this._impl;
    }
    constructor(_gl, info) {
        this._gl = _gl;
        this.info = info;
    }
    initialize() {
        const gl = this._gl;
        const sampler = gl.createSampler();
        gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, getFilter(this.info.magFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, getFilter(this.info.minFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, WebGL2RenderingContext.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, WebGL2RenderingContext.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, WebGL2RenderingContext.REPEAT);
        this._impl = sampler;
        return false;
    }
}
