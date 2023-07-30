import { CommandBuffer, Fence, Texture as GFX_Texture, SampleCountFlagBits, TextureUsageBits, impl } from "gfx-main";
import { Asset } from "../core/Asset.js";
import { device, loader } from "../core/impl.js";

let _commandBuffer: CommandBuffer;
let _fence: Fence;

export class Texture extends Asset {
    private _impl!: GFX_Texture;
    get impl() {
        return this._impl;
    }

    async load(url: string): Promise<this> {
        const imageBitmap = await loader.load(url, "bitmap", this.onProgress);
        const info = new impl.TextureInfo;
        info.samples = SampleCountFlagBits.SAMPLE_COUNT_1;
        info.usage = TextureUsageBits.SAMPLED | TextureUsageBits.TRANSFER_DST;
        info.width = imageBitmap.width;
        info.height = imageBitmap.height;
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
        _commandBuffer.copyImageBitmapToTexture(imageBitmap, texture);
        _commandBuffer.end();
        const submitInfo = new impl.SubmitInfo;
        submitInfo.commandBuffer = _commandBuffer;
        device.queue.submit(submitInfo, _fence);
        device.queue.waitFence(_fence);

        this._impl = texture;
        return this;
    }
    private onProgress(loaded: number, total: number, url: string) {
        console.log(`download: ${url}, progress: ${loaded / total * 100}`)
    }
}