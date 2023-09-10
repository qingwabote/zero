import { CommandBuffer, Fence, Texture as GFX_Texture, SampleCountFlagBits, TextureUsageBits } from "gfx-main";
import { Asset } from "../core/Asset.js";
import { device, gfx, loader } from "../core/impl.js";

let _commandBuffer: CommandBuffer;
let _fence: Fence;

export class Texture extends Asset {
    private _impl!: GFX_Texture;
    get impl() {
        return this._impl;
    }

    private _bitmap!: ImageBitmap;
    get bitmap() {
        return this._bitmap;
    }

    async load(url: string): Promise<this> {
        const bitmap = await loader.load(url, "bitmap", this.onProgress);
        const info = new gfx.TextureInfo;
        info.samples = SampleCountFlagBits.SAMPLE_COUNT_1;
        info.usage = TextureUsageBits.SAMPLED | TextureUsageBits.TRANSFER_DST;
        info.width = bitmap.width;
        info.height = bitmap.height;
        const texture = device.createTexture();
        texture.initialize(info);

        if (!_commandBuffer) {
            _commandBuffer = device.createCommandBuffer();
            _commandBuffer.initialize();
        }
        if (!_fence) {
            _fence = device.createFence();
            _fence.initialize();
        }
        _commandBuffer.begin();
        _commandBuffer.copyImageBitmapToTexture(bitmap, texture);
        _commandBuffer.end();
        const submitInfo = new gfx.SubmitInfo;
        submitInfo.commandBuffer = _commandBuffer;
        device.queue.submit(submitInfo, _fence);
        device.queue.waitFence(_fence);

        this._impl = texture;
        this._bitmap = bitmap;
        return this;
    }
    private onProgress(loaded: number, total: number, url: string) {
        console.log(`download: ${url}, progress: ${loaded / total * 100}`)
    }
}