import { device } from "boot";
import { CommandBuffer, Format, Texture, TextureInfo, TextureUsageFlagBits } from "gfx";
import { vec2, Vec2 } from "../../math/vec2.js";
import { MemoryView } from "../gfx/MemoryView.js";

const vec2_a = vec2.create();

function length2extent(out: Vec2, length: number) {
    if (length == 0) {
        out[0] = 0;
        out[1] = 0;
        return out;
    }

    const texels = Math.ceil(length / 4);
    const width = 1 << Math.ceil(Math.log2(Math.ceil(Math.sqrt(texels))));
    const height = 1 << Math.ceil(Math.log2(Math.ceil(texels / width)));
    out[0] = width;
    out[1] = height;
    return out;
}

export class TextureView extends MemoryView {
    readonly texture: Texture;

    constructor(length: number = 0) {
        const [width, height] = length2extent(vec2_a, length);
        super('f32', length, width * height * 4)

        const info = new TextureInfo;
        info.format = Format.RGBA32_SFLOAT;
        info.usage = TextureUsageFlagBits.SAMPLED | TextureUsageFlagBits.TRANSFER_DST;
        info.width = width;
        info.height = height;
        this.texture = device.createTexture(info);
    }

    public override reserve(min: number) {
        const [width, height] = length2extent(vec2_a, min);
        return super.reserve(width * height * 4);
    }

    protected override upload(commandBuffer: CommandBuffer, offset: number, length: number) {
        let { width, height } = this.texture.info;
        const extent = length2extent(vec2_a, this.length);
        if (width * height < extent[0] * extent[1]) {
            this.texture.resize(extent[0], extent[1]);
            width = extent[0];
            offset = 0;
            length = this.length;
        }

        const row_start = Math.floor(Math.floor(offset / 4) / width);
        const row_end = Math.ceil(Math.ceil((offset + length) / 4) / width);
        commandBuffer.copyBufferToTexture(this._source, row_start * width * 4, this.texture, 0, row_start, width, row_end - row_start);
    }
}