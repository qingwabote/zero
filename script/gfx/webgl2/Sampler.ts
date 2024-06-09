import { Filter } from 'gfx-common';
import { SamplerInfo } from './info.js';

function getFilter(val: Filter): GLenum {
    switch (val) {
        case Filter.NEAREST:
            return WebGL2RenderingContext.NEAREST;
        case Filter.LINEAR:
            return WebGL2RenderingContext.LINEAR;
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
        gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, getFilter(this.info.magFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, getFilter(this.info.minFilter));
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, WebGL2RenderingContext.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, WebGL2RenderingContext.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, WebGL2RenderingContext.REPEAT);
        this._impl = sampler;

        return false;
    }
}