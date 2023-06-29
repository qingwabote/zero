import Asset from "../core/Asset.js";
import CommandBuffer from "../core/gfx/CommandBuffer.js";
import Fence from "../core/gfx/Fence.js";
import { SampleCountFlagBits } from "../core/gfx/Pipeline.js";
import { default as GFX_Texture, TextureUsageBits } from "../core/gfx/Texture.js";

let _commandBuffer: CommandBuffer;
let _fence: Fence;

export default class Texture extends Asset {
    private _impl!: GFX_Texture;
    get impl() {
        return this._impl;
    }

    async load(url: string): Promise<this> {
        const imageBitmap = await loader.load(url, "bitmap", this.onProgress);
        const texture = gfx.device.createTexture();
        texture.initialize({
            samples: SampleCountFlagBits.SAMPLE_COUNT_1,
            usage: TextureUsageBits.SAMPLED | TextureUsageBits.TRANSFER_DST,
            width: imageBitmap.width, height: imageBitmap.height
        });

        if (!_commandBuffer) {
            _commandBuffer = gfx.device.createCommandBuffer();
            _commandBuffer.initialize();
        }
        if (!_fence) {
            _fence = gfx.device.createFence();
            _fence.initialize();
        }
        _commandBuffer.begin();
        _commandBuffer.copyImageBitmapToTexture(imageBitmap, texture);
        _commandBuffer.end();
        gfx.device.queue.submit({ commandBuffer: _commandBuffer }, _fence);
        gfx.device.queue.waitFence(_fence);

        this._impl = texture;
        return this;
    }
    private onProgress(loaded: number, total: number, url: string) {
        console.log(`download: ${url}, progress: ${loaded / total * 100}`)
    }
}