import { Buffer } from "./Buffer.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { Sampler } from "./Sampler.js";
import { Texture } from "./Texture.js";

export class DescriptorSet {
    private _buffers: Buffer[] = [];
    private _bufferRanges: number[] = [];

    private _textures: Texture[] = [];
    private _textureSamplers: Sampler[] = [];

    private _layout!: DescriptorSetLayout;

    get layout(): DescriptorSetLayout {
        return this._layout;
    }

    initialize(layout: DescriptorSetLayout): boolean {
        this._layout = layout;
        return false;
    }

    getBuffer(binding: number): Buffer {
        return this._buffers[binding];
    }

    getBufferRange(binding: number): number {
        return this._bufferRanges[binding];
    }

    bindBuffer(binding: number, buffer: Buffer, range?: number): void {
        this._buffers[binding] = buffer;
        this._bufferRanges[binding] = range ? range : buffer.info.size;
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