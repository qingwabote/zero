import { once } from "assets";
import { load } from "boot";
import { Texture } from 'engine';
import { spi } from "spi";
import { textureMap } from "./context.js";
export class Atlas {
    constructor() {
        this._textures = [];
    }
    get pointer() {
        return this._pointer;
    }
    async load(url) {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }
        const [, base, name] = res;
        const bin = await load(`${base}/${name}.atlas`, 'buffer');
        const dataPtr = spi.heap.addBuffer(new Uint8Array(bin));
        const atlasPtr = spi.fn.spiAtlas_create(dataPtr, bin.byteLength);
        spi.heap.delBuffer(dataPtr);
        const promises = [];
        let pagePtr = spi.fn.spiAtlas_getPages(atlasPtr);
        while (pagePtr) {
            promises.push((async () => {
                const page = pagePtr;
                const name = spi.fn.spiAtlasPage_getName(page);
                const texture = await once(`${base}/${spi.heap.getString(name)}`, Texture);
                spi.fn.spiAtlasPage_setRendererObject(page, textureMap.register(texture.impl));
                this._textures.push(texture);
            })());
            pagePtr = spi.fn.spiAtlasPage_getNext(pagePtr);
        }
        await Promise.all(promises);
        this._pointer = atlasPtr;
        return this;
    }
}
