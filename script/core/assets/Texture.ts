import CommandBuffer from "../gfx/CommandBuffer.js";
import Fence from "../gfx/Fence.js";
import { SampleCountFlagBits } from "../gfx/Pipeline.js";
import { default as GFX_Texture, TextureUsageBit } from "../gfx/Texture.js";
import Asset from "./Asset.js";

let _commandBuffer: CommandBuffer;
let _fence: Fence;

export default class Texture extends Asset {
    private _gfx_texture!: GFX_Texture;
    get gfx_texture() {
        return this._gfx_texture;
    }

    async load(url: string): Promise<Texture> {
        const arraybuffer = await loader.load(url, "arraybuffer", this.onProgress);
        const imageBitmap = await platform.decodeImage(arraybuffer);
        const texture = gfx.createTexture();
        texture.initialize({
            samples: SampleCountFlagBits.SAMPLE_COUNT_1,
            usage: TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST,
            width: imageBitmap.width, height: imageBitmap.height
        });

        if (!_commandBuffer) {
            _commandBuffer = gfx.createCommandBuffer();
            _commandBuffer.initialize();
        }
        if (!_fence) {
            _fence = gfx.createFence();
            _fence.initialize();
        }
        _commandBuffer.begin();
        _commandBuffer.copyImageBitmapToTexture(imageBitmap, texture);
        _commandBuffer.end();
        gfx.queue.submit({ commandBuffer: _commandBuffer }, _fence);
        gfx.queue.waitFence(_fence);

        this._gfx_texture = texture;
        return this;
    }
    private onProgress(loaded: number, total: number, url: string) {
        console.log(`download: ${url}, progress: ${loaded / total * 100}`)
    }
}