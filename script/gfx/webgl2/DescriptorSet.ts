import { Buffer } from "./Buffer.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { Sampler } from "./Sampler.js";
import { Texture } from "./Texture.js";

export class DescriptorSet {
    private _buffers: Buffer[] = [];
    private _bufferRanges: number[] = [];

    private _textures: Texture[] = [];
    private _textureSamplers: Sampler[] = [];

    constructor(readonly layout: DescriptorSetLayout) {

    }

    initialize(): boolean { return false; }

    getBuffer(binding: number): Buffer {
        return this._buffers[binding];
    }

    getBufferRange(binding: number): number {
        return this._bufferRanges[binding];
    }

    bindBuffer(binding: number, buffer: Buffer, range: number = 0): void {
        this._buffers[binding] = buffer;
        this._bufferRanges[binding] = range;
    }

    getTexture(binding: number): Texture {
        return this._textures[binding];
    }

    getSampler(binding: number): Sampler {
        return this._textureSamplers[binding];
    }

    bindTexture(binding: number, texture: Texture, sampler: Sampler): void {
        this._textures[binding] = texture;
        this._textureSamplers[binding] = sampler;
    }
}