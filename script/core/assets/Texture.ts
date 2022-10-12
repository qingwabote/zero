import CommandBuffer from "../gfx/CommandBuffer.js";
import Fence from "../gfx/Fence.js";
import { default as GFX_Texture } from "../gfx/Texture.js";
import Asset from "./Asset.js";

let _commandBuffer: CommandBuffer;
let _fence: Fence;

export default class Texture extends Asset {
    private _gfx_texture!: GFX_Texture;
    get gfx_texture() {
        return this._gfx_texture;
    }

    async load(url: string): Promise<Texture> {
        const arraybuffer = await zero.loader.load(url, "arraybuffer", this.onProgress);
        const imageBitmap = await zero.platfrom.decodeImage(arraybuffer);
        const texture = zero.gfx.createTexture();
        texture.initialize({ width: imageBitmap.width, height: imageBitmap.height });

        if (!_commandBuffer) {
            _commandBuffer = zero.gfx.createCommandBuffer();
            _commandBuffer.initialize();
        }
        if (!_fence) {
            _fence = zero.gfx.createFence();
            _fence.initialize();
        }
        _commandBuffer.begin();
        _commandBuffer.copyImageBitmapToTexture(imageBitmap, texture);
        _commandBuffer.end();
        zero.gfx.submit({ commandBuffer: _commandBuffer }, _fence);
        zero.gfx.waitFence(_fence);

        this._gfx_texture = texture;
        return this;
    }
    private onProgress(loaded: number, total: number, url: string) {
        console.log(`download: ${url}, progress: ${loaded / total * 100}`)
    }
}