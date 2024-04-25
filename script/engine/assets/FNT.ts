// http://www.angelcode.com/products/bmfont/doc/render_text.html

import { Asset, once } from "assets";
import { load } from "boot";
import { Texture } from "./Texture.js";

interface Info {
    size: number;
}

interface Common {
    lineHeight: number
}

interface Char {
    id: number; x: number; y: number; width: number; height: number; xoffset: number; yoffset: number; xadvance: number; page: number; chnl: number;
}

const exp_lineByline = /(.+)\r?\n?/g;
const exp_keyAndValue = /(\w+)=(\-?\d+)/g;
const exp_info = /info\s+/;
const exp_common = /common\s+/;
const exp_char = /char\s+/;

export class FNT implements Asset {
    private _info: any = {};
    get info(): Readonly<Info> {
        return this._info;
    }

    private _common: any = {};
    get common(): Readonly<Common> {
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
        const text = await load(`${parent}/${name}.fnt`, "text");

        while (true) {
            let res = exp_lineByline.exec(text);
            if (!res) {
                break;
            }

            let line = res[0];
            if (exp_info.test(line)) {
                let match;
                while (match = exp_keyAndValue.exec(line)) {
                    this._info[match[1]] = parseInt(match[2]);
                }
                continue;
            }

            if (exp_common.test(line)) {
                let match;
                while (match = exp_keyAndValue.exec(line)) {
                    this._common[match[1]] = parseInt(match[2]);
                }
                continue;
            }

            if (exp_char.test(line)) {
                const char: any = {};
                let match;
                while (match = exp_keyAndValue.exec(line)) {
                    char[match[1]] = parseInt(match[2]);
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
        this._texture = await once(`${parent}/${file}`, Texture);
        return this;
    }

}