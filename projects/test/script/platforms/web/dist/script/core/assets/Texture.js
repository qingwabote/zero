import Asset from "./Asset.js";
let _commandBuffer;
let _fence;
export default class Texture extends Asset {
    _gfx_texture;
    get gfx_texture() {
        return this._gfx_texture;
    }
    async load(url) {
        const arraybuffer = await zero.loader.load(url, "arraybuffer", this.onProgress);
        const imageBitmap = await zero.platfrom.decodeImage(arraybuffer);
        const texture = gfx.createTexture();
        texture.initialize({ width: imageBitmap.width, height: imageBitmap.height });
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
        gfx.submit({ commandBuffer: _commandBuffer }, _fence);
        gfx.waitFence(_fence);
        this._gfx_texture = texture;
        return this;
    }
    onProgress(loaded, total, url) {
        console.log(`download: ${url}, progress: ${loaded / total * 100}`);
    }
}
//# sourceMappingURL=Texture.js.map