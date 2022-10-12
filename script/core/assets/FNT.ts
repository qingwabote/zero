import Asset from "./Asset.js";
import Texture from "./Texture.js";

interface Char {
    id: number; x: number; y: number; width: number; height: number; xoffset: number; yoffset: number; xadvance: number; page: number; chnl: number;
}

export default class FNT extends Asset {
    private _chars: Record<number, Char> = {};
    get chars(): Record<string, Char> {
        return this._chars
    }

    private _texture!: Texture;
    get texture(): Texture {
        return this._texture;
    }

    async load(url: string): Promise<void> {
        let res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return;
        }
        const parent = res[1];
        const name = res[2];
        const text = await zero.loader.load(`${parent}/${name}.fnt`, "text");
        const resAll = text.matchAll(/char\s+id=(\-?\d+)\s+x=(\-?\d+)\s+y=(\-?\d+)\s+width=(\-?\d+)\s+height=(\-?\d+)\s+xoffset=(\-?\d+)\s+yoffset=(\-?\d+)\s+xadvance=(\-?\d+)\s+page=(\-?\d+)\s+chnl=(\-?\d+)\s+/g);
        for (const res of resAll) {
            const char: Char = {
                id: parseInt(res[1]),
                x: parseInt(res[2]),
                y: parseInt(res[3]),
                width: parseInt(res[4]),
                height: parseInt(res[5]),
                xoffset: parseInt(res[6]),
                yoffset: parseInt(res[7]),
                xadvance: parseInt(res[8]),
                page: parseInt(res[9]),
                chnl: parseInt(res[10])
            }
            this._chars[char.id] = char;
        }

        res = text.match(/file="(.+)"/);
        if (!res) {
            return;
        }
        const file = res[1];
        this._texture = await (new Texture).load(`${parent}/${file}`);
    }

}