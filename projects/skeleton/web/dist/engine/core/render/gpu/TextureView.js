import { device } from "boot";
import { Format, TextureInfo, TextureUsageFlagBits } from "gfx";
import { MemoryView } from "./MemoryView.js";
function length2extent(length) {
    const texels = Math.ceil(length / 4);
    const extent = Math.ceil(Math.sqrt(texels));
    const n = Math.ceil(Math.log2(extent));
    return Math.pow(2, n);
}
export class TextureView extends MemoryView {
    get texture() {
        return this._texture;
    }
    constructor(length = 0) {
        const extent = length2extent(length);
        const capacity = extent * extent * 4;
        super(new Float32Array(capacity), length);
        const info = new TextureInfo;
        info.format = Format.RGBA32_SFLOAT;
        info.usage = TextureUsageFlagBits.SAMPLED | TextureUsageFlagBits.TRANSFER_DST;
        info.width = info.height = extent;
        this._texture = device.createTexture(info);
    }
    reserve(min) {
        const extent = length2extent(min);
        const capacity = extent * extent * 4;
        if (this._source.length >= capacity) {
            return null;
        }
        const old = this._source;
        this._source = new Float32Array(capacity);
        return old;
    }
    upload(commandBuffer) {
        const extent = length2extent(this.length);
        let width = this._texture.info.width;
        if (width < extent) {
            this._texture.resize(extent, extent);
            width = extent;
        }
        const height = Math.ceil(Math.ceil(this.length / 4) / width);
        commandBuffer.copyBufferToTexture(this._source, this._texture, 0, 0, width, height);
    }
}
