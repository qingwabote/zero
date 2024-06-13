import { device, load } from "boot";
import { SubmitInfo, TextureInfo, TextureUsageFlagBits } from "gfx";
let _commandBuffer;
let _fence;
export class Texture {
    constructor() {
        this._width = 0;
        this._height = 0;
        this._url = '';
        // private onProgress(loaded: number, total: number, url: string) {
        //     console.log(`download: ${url}, progress: ${loaded / total * 100}`)
        // }
    }
    get impl() {
        return this._impl;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get url() {
        return this._url;
    }
    async load(url) {
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
}
