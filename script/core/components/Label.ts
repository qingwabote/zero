// http://www.angelcode.com/products/bmfont/doc/render_text.html

import FNT from "../assets/FNT.js";
import Component from "../Component.js";
import Buffer, { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { Format, IndexType } from "../gfx/Pipeline.js";
import Material from "../render/Material.js";
import Mesh from "../render/Mesh.js";
import Pass from "../render/Pass.js";
import SubMesh, { Attribute } from "../render/SubMesh.js";
import shaders from "../shaders.js";
import MeshRenderer from "./MeshRenderer.js";

export default class Label extends Component {
    private _text: string = "";
    get text(): string {
        return this._text;
    }
    set text(value: string) {
        this._text = value;
    }

    private _fnt!: FNT;
    get fnt(): FNT {
        return this._fnt;
    }
    set fnt(value: FNT) {
        this._fnt = value;
    }

    override start(): void {
        const uvArray = new Float32Array(2 * 4 * this._text.length);
        const posArray = new Float32Array(4 * 4 * this._text.length);
        const indexArray = new Uint16Array(6 * this._text.length);
        const tex = this._fnt.texture.gfx_texture.info;
        let x = 0;
        for (let i = 0; i < this._text.length; i++) {
            const char = this._fnt.chars[this._text.charCodeAt(i)];
            const l = char.x / tex.width;
            const r = (char.x + char.width) / tex.width;
            const t = char.y / tex.height;
            const b = (char.y + char.height) / tex.height;

            x += char.xoffset;

            uvArray[2 * 4 * i + 0] = l;
            uvArray[2 * 4 * i + 1] = t;
            posArray[4 * 4 * i + 0] = x;
            posArray[4 * 4 * i + 1] = -char.yoffset;
            posArray[4 * 4 * i + 2] = 0;
            posArray[4 * 4 * i + 3] = 1;

            uvArray[2 * 4 * i + 2] = r;
            uvArray[2 * 4 * i + 3] = t;
            posArray[4 * 4 * i + 4] = x + char.width;
            posArray[4 * 4 * i + 5] = -char.yoffset;
            posArray[4 * 4 * i + 6] = 0;
            posArray[4 * 4 * i + 7] = 1;

            uvArray[2 * 4 * i + 4] = r;
            uvArray[2 * 4 * i + 5] = b;
            posArray[4 * 4 * i + 8] = x + char.width;
            posArray[4 * 4 * i + 9] = -char.yoffset - char.height;
            posArray[4 * 4 * i + 10] = 0;
            posArray[4 * 4 * i + 11] = 1;

            uvArray[2 * 4 * i + 6] = l;
            uvArray[2 * 4 * i + 7] = b;
            posArray[4 * 4 * i + 12] = x;
            posArray[4 * 4 * i + 13] = -char.yoffset - char.height;
            posArray[4 * 4 * i + 14] = 0;
            posArray[4 * 4 * i + 15] = 1;

            x += char.width;

            indexArray.set([
                4 * i + 0,
                4 * i + 1,
                4 * i + 2,
                4 * i + 2,
                4 * i + 3,
                4 * i + 0
            ], 6 * i)
        }

        const attributes: Attribute[] = [];
        const vertexBuffers: Buffer[] = [];
        const vertexOffsets: number[] = [];

        let attribute: Attribute = {
            name: "a_texCoord",
            format: Format.RG32F,
            buffer: vertexBuffers.length,
            offset: 0
        };
        attributes.push(attribute);

        const uvBuffer = zero.gfx.createBuffer();
        uvBuffer.initialize({ usage: BufferUsageFlagBits.VERTEX, size: uvArray.byteLength });
        uvBuffer.update(uvArray);
        vertexBuffers.push(uvBuffer);
        vertexOffsets.push(0);

        attribute = {
            name: "a_position",
            format: Format.RGBA32F,
            buffer: vertexBuffers.length,
            offset: 0
        };
        attributes.push(attribute);

        const posBuffer = zero.gfx.createBuffer();
        posBuffer.initialize({ usage: BufferUsageFlagBits.VERTEX, size: posArray.byteLength });
        posBuffer.update(posArray);
        vertexBuffers.push(posBuffer);
        vertexOffsets.push(0);

        const indexBuffer = zero.gfx.createBuffer();
        indexBuffer.initialize({ usage: BufferUsageFlagBits.INDEX, size: indexArray.byteLength });
        indexBuffer.update(indexArray);

        const mesh: Mesh = new Mesh([new SubMesh(attributes, vertexBuffers, vertexOffsets, indexBuffer, IndexType.UINT16, indexArray.length, 0)]);
        const shader = shaders.getShader('zero', { USE_ALBEDO_MAP: 1 });
        const pass = new Pass(shader);
        pass.descriptorSet.bindTexture(0, this._fnt.texture.gfx_texture);
        const material = new Material([pass]);

        const renderer = this._node.addComponent(MeshRenderer);
        renderer.mesh = mesh;
        renderer.materials = [material];
    }
}