import { device } from "boot";
import { CommandBuffer, Format, Texture, TextureInfo, TextureUsageFlagBits } from "gfx";
import { MemoryView } from "../gfx/MemoryView.js";

function length2extent(length: number): number {
    const texels = Math.ceil(length / 4);
    const extent = Math.ceil(Math.sqrt(texels));
    const n = Math.ceil(Math.log2(extent));
    return Math.pow(2, n);
}

export class TextureView extends MemoryView {
    private readonly _texture: Texture;
    get texture(): Texture {
        return this._texture;
    }

    constructor(length: number = 0) {
        const extent = length2extent(length);
        super('f32', length, extent * extent * 4)

        const info = new TextureInfo;
        info.format = Format.RGBA32_SFLOAT;
        info.usage = TextureUsageFlagBits.SAMPLED | TextureUsageFlagBits.TRANSFER_DST;
        info.width = info.height = extent;
        this._texture = device.createTexture(info);
    }

    public override reserve(min: number) {
        const extent = length2extent(min);
        const capacity = extent * extent * 4;
        return super.reserve(capacity);
    }

    protected override upload(commandBuffer: CommandBuffer, offset: number, length: number) {
        const extent = length2extent(this.length);
        let width = this._texture.info.width;
        if (width < extent) {
            this._texture.resize(extent, extent);
            width = extent;
            offset = 0;
            length = this.length;
        }

        const row_start = Math.floor(Math.floor(offset / 4) / width);
        const row_end = Math.ceil(Math.ceil((offset + length) / 4) / width);
        commandBuffer.copyBufferToTexture(this._source, row_start * width * 4, this._texture, 0, row_start, width, row_end - row_start);
    }
}