import { SamplerInfo } from './info.js';

export class Sampler {
    private _impl!: WebGLSampler;
    get impl(): WebGLSampler {
        return this._impl;
    }

    constructor(private _gl: WebGL2RenderingContext, readonly info: SamplerInfo) { }

    initialize(): boolean {
        const gl = this._gl;

        const sampler = gl.createSampler()!
        gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, this.info.minFilter as unknown as GLint);
        gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, this.info.magFilter as unknown as GLint);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, gl.REPEAT);
        this._impl = sampler;

        return false;
    }
}