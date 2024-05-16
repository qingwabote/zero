import { Asset } from "assets";
import { device, load } from "boot";
import { CommandBuffer, Fence, Texture as GFX_Texture, SubmitInfo, TextureInfo, TextureUsageFlagBits } from "gfx";

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

    private _url: string = '';
    public get url(): string {
        return this._url;
    }

    async load(url: string): Promise<this> {
        const bitmap = await load(url, "bitmap");
        const info = new TextureInfo;
        info.usage = TextureUsageFlagBits.SAMPLED | TextureUsageFlagBits.TRANSFER_DST;
        info.width = bitmap.width;
        info.height = bitmap.height;
        const texture = device.createTexture(info);

        if (!_commandBuffer) {
            _commandBuffer = device.createCommandBuffer();
        }
        if (!_fence) {
            _fence = device.createFence();
        }
        _commandBuffer.begin();
        _commandBuffer.copyImageBitmapToTexture(bitmap, texture);
        _commandBuffer.end();
        const submitInfo = new SubmitInfo;
        submitInfo.commandBuffer = _commandBuffer;
        device.queue.submit(submitInfo, _fence);
        device.queue.wait(_fence);

        this._width = bitmap.width;
        this._height = bitmap.height;
        this._url = url;
        this._impl = texture;

        return this;
    }

    // private onProgress(loaded: number, total: number, url: string) {
    //     console.log(`download: ${url}, progress: ${loaded / total * 100}`)
    // }
}