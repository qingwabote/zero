// http://www.angelcode.com/products/bmfont/doc/render_text.html

import FNT from "../assets/FNT.js";
import Component from "../Component.js";
import Buffer, { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { Format, FormatInfos, IndexType, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../gfx/Pipeline.js";
import Model from "../render/Model.js";
import Pass from "../render/Pass.js";
import SubModel from "../render/SubModel.js";
import shaders from "../shaders.js";

enum DirtyFlagBit {
    NONE = 0,
    TEXT = (1 << 0),
    CAPABILITY = (1 << 1)
}

export default class Label extends Component {
    private _dirtyFlag: DirtyFlagBit = DirtyFlagBit.TEXT | DirtyFlagBit.CAPABILITY;

    private _capability: number = 0;
    private _text: string = "";
    get text(): string {
        return this._text;
    }
    set text(value: string) {
        if (this._text == value) {
            return;
        }
        if (value.length > this._capability) {
            this._dirtyFlag |= DirtyFlagBit.CAPABILITY;
            this._capability = value.length;
        }
        this._text = value;
        this._dirtyFlag |= DirtyFlagBit.TEXT;
    }

    private _fnt!: FNT;
    get fnt(): FNT {
        return this._fnt;
    }
    set fnt(value: FNT) {
        this._fnt = value;
    }

    private _texCoordArray = new Float32Array;
    private _texCoordBuffer!: Buffer;

    private _positionArray = new Float32Array;
    private _positionBuffer!: Buffer;

    private _indexArray = new Uint16Array;
    private _indexBuffer!: Buffer;

    private _vertexInputState!: VertexInputState;

    private _subModel!: SubModel;

    override start(): void {
        const shader = shaders.getShader('zero', { USE_ALBEDO_MAP: 1 });

        const attributes: VertexInputAttributeDescription[] = [];
        const bindings: VertexInputBindingDescription[] = [];

        let definition = shader.info.meta.attributes["a_texCoord"];
        let attribute: VertexInputAttributeDescription = {
            location: definition.location,
            binding: 0,
            format: Format.RG32F,
            offset: 0
        };
        attributes.push(attribute);
        bindings.push({
            binding: attribute.binding,
            stride: FormatInfos[attribute.format].size,
            inputRate: VertexInputRate.VERTEX
        })

        definition = shader.info.meta.attributes["a_position"];
        attribute = {
            location: definition.location,
            binding: 1,
            format: Format.RGBA32F,
            offset: 0
        };
        attributes.push(attribute);
        bindings.push({
            binding: attribute.binding,
            stride: FormatInfos[attribute.format].size,
            inputRate: VertexInputRate.VERTEX
        })

        this._vertexInputState = { attributes, bindings };

        const pass = new Pass(shader);
        pass.descriptorSet.bindTexture(0, this._fnt.texture.gfx_texture);

        const subModel: SubModel = { passes: [pass] };
        const model = new Model([subModel], this._node);
        zero.renderScene.models.push(model);
        this._subModel = subModel;
    }

    override update(dt: number): void {
        if (this._dirtyFlag == DirtyFlagBit.NONE) {
            return;
        }
        const indexCount = 6 * this._text.length
        if (this._dirtyFlag & DirtyFlagBit.CAPABILITY) {
            this._texCoordArray = new Float32Array(2 * 4 * this._text.length);
            this._texCoordBuffer = zero.gfx.createBuffer();
            this._texCoordBuffer.initialize({ usage: BufferUsageFlagBits.VERTEX, size: this._texCoordArray.byteLength });

            this._positionArray = new Float32Array(4 * 4 * this._text.length);
            this._positionBuffer = zero.gfx.createBuffer();
            this._positionBuffer.initialize({ usage: BufferUsageFlagBits.VERTEX, size: this._positionArray.byteLength });

            this._indexArray = new Uint16Array(indexCount);
            this._indexBuffer = zero.gfx.createBuffer();
            this._indexBuffer.initialize({ usage: BufferUsageFlagBits.INDEX, size: this._indexArray.byteLength });
        }

        const texCoordArray = this._texCoordArray;
        const positionArray = this._positionArray;
        const indexArray = this._indexArray;
        const tex = this._fnt.texture.gfx_texture.info;
        let x = 0;
        for (let i = 0; i < this._text.length; i++) {
            const char = this._fnt.chars[this._text.charCodeAt(i)];
            const l = char.x / tex.width;
            const r = (char.x + char.width) / tex.width;
            const t = char.y / tex.height;
            const b = (char.y + char.height) / tex.height;

            x += char.xoffset;

            texCoordArray[2 * 4 * i + 0] = l;
            texCoordArray[2 * 4 * i + 1] = t;
            positionArray[4 * 4 * i + 0] = x;
            positionArray[4 * 4 * i + 1] = -char.yoffset;
            positionArray[4 * 4 * i + 2] = 0;
            positionArray[4 * 4 * i + 3] = 1;

            texCoordArray[2 * 4 * i + 2] = r;
            texCoordArray[2 * 4 * i + 3] = t;
            positionArray[4 * 4 * i + 4] = x + char.width;
            positionArray[4 * 4 * i + 5] = -char.yoffset;
            positionArray[4 * 4 * i + 6] = 0;
            positionArray[4 * 4 * i + 7] = 1;

            texCoordArray[2 * 4 * i + 4] = r;
            texCoordArray[2 * 4 * i + 5] = b;
            positionArray[4 * 4 * i + 8] = x + char.width;
            positionArray[4 * 4 * i + 9] = -char.yoffset - char.height;
            positionArray[4 * 4 * i + 10] = 0;
            positionArray[4 * 4 * i + 11] = 1;

            texCoordArray[2 * 4 * i + 6] = l;
            texCoordArray[2 * 4 * i + 7] = b;
            positionArray[4 * 4 * i + 12] = x;
            positionArray[4 * 4 * i + 13] = -char.yoffset - char.height;
            positionArray[4 * 4 * i + 14] = 0;
            positionArray[4 * 4 * i + 15] = 1;

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

        this._texCoordBuffer.update(texCoordArray);
        this._positionBuffer.update(positionArray);
        this._indexBuffer.update(indexArray);

        this._subModel.inputAssembler = {
            vertexInputState: this._vertexInputState,
            vertexBuffers: [this._texCoordBuffer, this._positionBuffer],
            vertexOffsets: [0, 0],
            indexBuffer: this._indexBuffer,
            indexType: IndexType.UINT16,
            indexCount,
            indexOffset: 0
        }

        this._dirtyFlag = DirtyFlagBit.NONE;
    }
}