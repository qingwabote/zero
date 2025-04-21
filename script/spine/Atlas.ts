import { Asset, once } from "assets";
import { load } from "boot";
import { Texture } from 'engine';
import { pk } from "puttyknife";
import { textureMap } from "./context.js";

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

        const dataPtr = pk.heap.addBuffer(new Uint8Array(bin), 0);
        const atlasPtr = pk.fn.spiAtlas_create(dataPtr, bin.byteLength);
        pk.heap.delBuffer(dataPtr);

        const promises: Promise<void>[] = [];
        let pagePtr = pk.fn.spiAtlas_getPages(atlasPtr);
        while (pagePtr) {
            promises.push(
                (async () => {
                    const page = pagePtr;
                    const name = pk.fn.spiAtlasPage_getName(page);
                    const texture = await once(`${base}/${pk.heap.getString(name)}`, Texture);
                    pk.fn.spiAtlasPage_setRendererObject(page, textureMap.register(texture.impl));
                    this._textures.push(texture);
                })()
            );
            pagePtr = pk.fn.spiAtlasPage_getNext(pagePtr);
        }
        await Promise.all(promises);

        this._pointer = atlasPtr;

        return this;
    }
}