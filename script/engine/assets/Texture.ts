import { CommandBuffer, Fence, Texture as GFX_Texture, SampleCountFlagBits, SubmitInfo, TextureInfo, TextureUsageBits } from "gfx";
import { load } from "loader";
import { Asset } from "../core/Asset.js";
import { device } from "../core/impl.js";

let _commandBuffer: CommandBuffer;
let _fence: Fence;

export class Texture implements Asset {
    private _impl!: GFX_Texture;
    get impl() {
        return this._impl;
    }

    private _width: number = 0;
    public get width(): number {
        return this._width;
    }

    private _height: number = 0;
    public get height(): number {
        return this._height;
    }

    async load(url: string): Promise<this> {
        const bitmap = await load(url, "bitmap", this.onProgress);
        const info = new TextureInfo;
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
        const submitInfo = new SubmitInfo;
        submitInfo.commandBuffer = _commandBuffer;
        device.queue.submit(submitInfo, _fence);
        device.queue.waitFence(_fence);

        this._width = bitmap.width;
        this._height = bitmap.height;
        this._impl = texture;

        return this;
    }

    private onProgress(loaded: number, total: number, url: string) {
        console.log(`download: ${url}, progress: ${loaded / total * 100}`)
    }
}