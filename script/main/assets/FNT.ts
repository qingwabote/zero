// http://www.angelcode.com/products/bmfont/doc/render_text.html

import AssetCache from "../AssetCache.js";
import Asset from "./Asset.js";
import Texture from "./Texture.js";

interface Common {
    lineHeight: number
}

interface Char {
    id: number; x: number; y: number; width: number; height: number; xoffset: number; yoffset: number; xadvance: number; page: number; chnl: number;
}

const exp_lineByline = /(.+)\r?\n?/g;
const exp_keyAndValue = /(\w+)=(\-?\d+)/g;
const exp_common = /common\s+/;
const exp_char = /char\s+/;

export default class FNT extends Asset {
    private _common!: Common;
    get common() {
        return this._common;
    }

    private _chars: Record<number, Char> = {};
    get chars(): Record<string, Char> {
        return this._chars
    }

    private _texture!: Texture;
    get texture(): Texture {
        return this._texture;
    }

    async load(url: string): Promise<this> {
        let res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }
        const parent = res[1];
        const name = res[2];
        const text = await loader.load(`${parent}/${name}.fnt`, "text");

        while (true) {
            let res = exp_lineByline.exec(text);
            if (!res) {
                break;
            }

            let line = res[0];
            if (exp_common.test(line)) {
                const resAll = line.matchAll(exp_keyAndValue);
                const common: any = {};
                for (const res of resAll) {
                    common[res[1]] = parseInt(res[2]);
                }
                this._common = common;
                continue;
            }

            if (exp_char.test(line)) {
                const resAll = line.matchAll(exp_keyAndValue);
                const char: any = {};
                for (const res of resAll) {
                    char[res[1]] = parseInt(res[2]);
                }
                this._chars[char.id] = char;
                continue;
            }
        }

        res = text.match(/file="(.+)"/);
        if (!res) {
            return this;
        }
        const file = res[1];
        this._texture = await AssetCache.instance.load(`${parent}/${file}`, Texture);
        return this;
    }

}