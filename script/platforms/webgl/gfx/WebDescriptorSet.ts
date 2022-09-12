import Buffer from "../../../core/gfx/Buffer.js";
import { DescriptorSet, DescriptorSetLayout } from "../../../core/gfx/Pipeline.js";
import Texture from "../../../core/gfx/Texture.js";

export default class WebDescriptorSet implements DescriptorSet {
    private _layout!: DescriptorSetLayout;
    get layout(): DescriptorSetLayout {
        return this._layout;
    }

    private _buffers: Buffer[] = [];
    get buffers(): readonly Buffer[] {
        return this._buffers;
    }

    private _textures: Texture[] = [];
    get textures(): readonly Texture[] {
        return this._textures;
    }

    initialize(layout: DescriptorSetLayout): boolean {
        this._layout = layout;
        return false;
    }

    bindBuffer(binding: number, buffer: Buffer): void {
        this._buffers[binding] = buffer;
    }

    bindTexture(binding: number, texture: Texture): void {
        this._textures[binding] = texture;
    }
}