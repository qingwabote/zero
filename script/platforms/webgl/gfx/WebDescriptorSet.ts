import Buffer from "../../../core/gfx/Buffer.js";
import { DescriptorSet, DescriptorSetLayout } from "../../../core/gfx/Pipeline.js";
import Texture from "../../../core/gfx/Texture.js";

export default class WebDescriptorSet implements DescriptorSet {
    private _layout!: DescriptorSetLayout;
    get layout(): DescriptorSetLayout {
        return this._layout;
    }

    private _buffers: Buffer[] = [];

    private _bufferRanges: number[] = [];

    private _textures: Texture[] = [];

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

    bindTexture(binding: number, texture: Texture): void {
        this._textures[binding] = texture;
    }
}