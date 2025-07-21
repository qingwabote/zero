import { FNT } from "./assets/FNT.js";
import { vec2, Vec2Like } from "./core/math/vec2.js";
import { BufferView } from "./core/render/gfx/BufferView.js";

const lineBreak = '\n'.charCodeAt(0);

export const bmfont = {
    mesh(out_vertex: BufferView, out_min: Vec2Like, out_max: Vec2Like, fnt: FNT, text: string, ppu: number, x: number = 0, y: number = 0): number {
        const o = x;
        const tex = fnt.texture.impl.info;
        let [l, r, t, b, quads] = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0];
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code == lineBreak) {
                x = o;
                y -= fnt.common.lineHeight / ppu;
                continue;
            }

            const char = fnt.chars[code];
            if (!char) {
                console.warn(`char ${text[i]} does not exist in fnt`);
                continue;
            }
            const tex_l = char.x / tex.width;
            const tex_r = (char.x + char.width) / tex.width;
            const tex_t = char.y / tex.height;
            const tex_b = (char.y + char.height) / tex.height;

            const xoffset = char.xoffset / ppu;
            const yoffset = char.yoffset / ppu;
            const width = char.width / ppu;
            const height = char.height / ppu;

            const pos_l = x + xoffset;
            const pos_r = x + xoffset + width;
            const pos_t = y - yoffset;
            const pos_b = y - yoffset - height;

            const offset = out_vertex.addBlock(16);
            const source = out_vertex.source;

            source[offset + 0] = pos_l;
            source[offset + 1] = pos_t;
            source[offset + 2] = tex_l;
            source[offset + 3] = tex_t;

            source[offset + 4] = pos_l;
            source[offset + 5] = pos_b;
            source[offset + 6] = tex_l;
            source[offset + 7] = tex_b;

            source[offset + 8] = pos_r;
            source[offset + 9] = pos_b;
            source[offset + 10] = tex_r;
            source[offset + 11] = tex_b;

            source[offset + 12] = pos_r;
            source[offset + 13] = pos_t;
            source[offset + 14] = tex_r;
            source[offset + 15] = tex_t;

            l = Math.min(l, pos_l);
            r = Math.max(r, pos_r);
            t = Math.max(t, pos_t);
            b = Math.min(b, pos_b);

            x += char.xadvance / ppu;

            quads++;
        }

        vec2.set(out_min, l, b);
        vec2.set(out_max, r, t);

        return quads;
    }
}