import { Asset, once } from "assets";
import { load } from "boot";
import { Texture } from 'engine';
import { textureMap } from "./context.js";
import { wasm } from "./wasm.js";

export class Atlas implements Asset {
    private _textures: Texture[] = [];

    private _pointer!: number;
    public get pointer(): number {
        return this._pointer;
    }

    async load(url: string): Promise<this> {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }

        const [, base, name] = res;
        const bin = await load(`${base}/${name}.atlas`, 'buffer');

        const dataPtr = wasm.exports.malloc(bin.byteLength);
        wasm.HEAPU8.set(new Uint8Array(bin), dataPtr);
        const dirPtr = wasm.exports.malloc(1);
        wasm.HEAPU8[dirPtr] = 0;
        const atlasPtr = wasm.exports.spiAtlas_create(dataPtr, bin.byteLength, dirPtr, 0);
        wasm.exports.free(dataPtr);
        wasm.exports.free(dirPtr);

        const promises: Promise<void>[] = [];
        let pagePtr = wasm.exports.spiAtlas_getPages(atlasPtr);
        while (pagePtr) {
            promises.push(
                (async () => {
                    const page = pagePtr;
                    const name = wasm.exports.spiAtlasPage_getName(page);
                    const texture = await once(`${base}/${wasm.string_decode(name)}`, Texture);
                    wasm.exports.spiAtlasPage_setRendererObject(page, textureMap.register(texture.impl));
                    this._textures.push(texture);
                })()
            );
            pagePtr = wasm.exports.spiAtlasPage_getNext(pagePtr);
        }
        await Promise.all(promises);

        this._pointer = atlasPtr;

        return this;
    }
}