import { Filter } from 'gfx-common';
import { SamplerInfo } from './info.js';

function getFilter(gl: WebGL2RenderingContext, val: Filter): GLenum {
    switch (val) {
        case Filter.NEAREST:
            return gl.NEAREST;
        case Filter.LINEAR:
            return gl.LINEAR;
    }
}

export class Sampler {
    private _impl!: WebGLSampler;
    get impl(): WebGLSampler {
        return this._impl;
    }

    constructor(private _gl: WebGL2RenderingContext, readonly info: SamplerInfo) { }

    initialize(): boolean {
        const gl = this._gl;

        const sampler = gl.createSampler()!
        gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, getFilter(gl, this.info.magFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, getFilter(gl, this.info.minFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, gl.REPEAT);
        this._impl = sampler;

        return false;
    }
}