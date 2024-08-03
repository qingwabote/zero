import { Filter } from 'gfx-common';
function getFilter(gl, val) {
    switch (val) {
        case Filter.NEAREST:
            return gl.NEAREST;
        case Filter.LINEAR:
            return gl.LINEAR;
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
        gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, getFilter(gl, this.info.magFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, getFilter(gl, this.info.minFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, gl.REPEAT);
        this._impl = sampler;
        return false;
    }
}
