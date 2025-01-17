import { Texture } from "./Texture.js";
import { wasm } from "./wasm.js";

class TextureAtlasPage {
    constructor(readonly name: string) { }

    setTexture(texture: Texture) {

    }
}

export class TextureAtlas {
    readonly pages: readonly TextureAtlasPage[];

    private readonly _pointer: number;

    constructor(bin: ArrayBuffer) {
        const dataPtr = wasm.exports.malloc(bin.byteLength);
        wasm.HEAPU8.set(new Uint8Array(bin), dataPtr);
        const dirPtr = wasm.exports.malloc(1);
        wasm.HEAPU8[dirPtr] = 0;
        const atlasPtr = wasm.exports.spAtlas_create(dataPtr, bin.byteLength, dirPtr, 0);
        wasm.exports.free(dataPtr);
        wasm.exports.free(dirPtr);

        const pages: TextureAtlasPage[] = [];
        let pagePtr = wasm.exports.spAtlas_getPages(atlasPtr);
        while (pagePtr) {
            const namePtr = wasm.exports.spAtlasPage_getName(pagePtr);
            pages.push(new TextureAtlasPage(wasm.string_decode(namePtr)));
            pagePtr = wasm.exports.spAtlasPage_getNext(pagePtr)
        }
        this.pages = pages;

        this._pointer = atlasPtr;
    }
}