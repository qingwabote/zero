// http://www.angelcode.com/products/bmfont/doc/render_text.html

import FNT from "../assets/FNT.js";
import Component from "../Component.js";
import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { FormatInfos, IndexType, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";
import BufferViewResizable from "../render/BufferViewResizable.js";
import Model from "../render/Model.js";
import Pass from "../render/Pass.js";
import SubModel from "../render/SubModel.js";
import shaders from "../shaders.js";

enum DirtyFlagBits {
    NONE = 0,
    TEXT = (1 << 0),
}

export default class Label extends Component {
    private _dirtyFlag: DirtyFlagBits = DirtyFlagBits.TEXT;

    private _text: string = "";
    get text(): string {
        return this._text;
    }
    set text(value: string) {
        if (this._text == value) {
            return;
        }
        this._text = value;
        this._dirtyFlag |= DirtyFlagBits.TEXT;
    }

    private _fnt!: FNT;
    get fnt(): FNT {
        return this._fnt;
    }
    set fnt(value: FNT) {
        this._fnt = value;
    }

    private _shader!: Shader;
    get shader(): Shader {
        return this._shader;
    }
    set shader(value: Shader) {
        this._shader = value;
    }

    private _texCoordBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);

    private _positionBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);

    private _indexBuffer = new BufferViewResizable("Uint16", BufferUsageFlagBits.INDEX);

    private _vertexInputState!: VertexInputState;

    private _subModel!: SubModel;

    override start(): void {
        const attributes: VertexInputAttributeDescription[] = [];
        const bindings: VertexInputBindingDescription[] = [];

        let definition = this._shader.info.meta.attributes["a_texCoord"];
        let attribute: VertexInputAttributeDescription = {
            location: definition.location,
            format: definition.format,
            binding: 0,
            offset: 0
        };
        attributes.push(attribute);
        bindings.push({
            binding: attribute.binding,
            stride: FormatInfos[attribute.format].size,
            inputRate: VertexInputRate.VERTEX
        })

        definition = this._shader.info.meta.attributes["a_position"];
        attribute = {
            location: definition.location,
            format: definition.format,
            binding: 1,
            offset: 0
        };
        attributes.push(attribute);
        bindings.push({
            binding: attribute.binding,
            stride: FormatInfos[attribute.format].size,
            inputRate: VertexInputRate.VERTEX
        })

        this._vertexInputState = { attributes, bindings, hash: "Label" };

        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(shaders.getDescriptorSetLayout(this._shader));
        descriptorSet.bindTexture(0, this._fnt.texture.gfx_texture);
        const pass = new Pass(descriptorSet, this._shader);
        const subModel: SubModel = { inputAssemblers: [], passes: [pass] };
        const model = new Model([subModel], this._node);
        zero.renderScene.models.push(model);
        this._subModel = subModel;
    }

    override update(dt: number): void {
        if (this._dirtyFlag == DirtyFlagBits.NONE) {
            return;
        }
        if (this._text.length == 0) {
            this._subModel.inputAssemblers.length = 0;
            return;
        }
        const indexCount = 6 * this._text.length;

        this._texCoordBuffer.reset(2 * 4 * this._text.length);
        this._positionBuffer.reset(3 * 4 * this._text.length);
        this._indexBuffer.reset(indexCount)

        const tex = this._fnt.texture.gfx_texture.info;
        let x = 0;
        for (let i = 0; i < this._text.length; i++) {
            const char = this._fnt.chars[this._text.charCodeAt(i)];
            const l = char.x / tex.width;
            const r = (char.x + char.width) / tex.width;
            const t = char.y / tex.height;
            const b = (char.y + char.height) / tex.height;

            x += char.xoffset;

            this._texCoordBuffer.data[2 * 4 * i + 0] = l;
            this._texCoordBuffer.data[2 * 4 * i + 1] = t;
            this._positionBuffer.data[3 * 4 * i + 0] = x;
            this._positionBuffer.data[3 * 4 * i + 1] = -char.yoffset;
            this._positionBuffer.data[3 * 4 * i + 2] = 0;

            this._texCoordBuffer.data[2 * 4 * i + 2] = r;
            this._texCoordBuffer.data[2 * 4 * i + 3] = t;
            this._positionBuffer.data[3 * 4 * i + 3] = x + char.width;
            this._positionBuffer.data[3 * 4 * i + 4] = -char.yoffset;
            this._positionBuffer.data[3 * 4 * i + 5] = 0;

            this._texCoordBuffer.data[2 * 4 * i + 4] = r;
            this._texCoordBuffer.data[2 * 4 * i + 5] = b;
            this._positionBuffer.data[3 * 4 * i + 6] = x + char.width;
            this._positionBuffer.data[3 * 4 * i + 7] = -char.yoffset - char.height;
            this._positionBuffer.data[3 * 4 * i + 8] = 0;

            this._texCoordBuffer.data[2 * 4 * i + 6] = l;
            this._texCoordBuffer.data[2 * 4 * i + 7] = b;
            this._positionBuffer.data[3 * 4 * i + 9] = x;
            this._positionBuffer.data[3 * 4 * i + 10] = -char.yoffset - char.height;
            this._positionBuffer.data[3 * 4 * i + 11] = 0;

            x += char.width;
            // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
            this._indexBuffer.set([
                4 * i + 0,
                4 * i + 2,
                4 * i + 1,
                4 * i + 2,
                4 * i + 0,
                4 * i + 3
            ], 6 * i)
        }

        this._texCoordBuffer.update();
        this._positionBuffer.update();
        this._indexBuffer.update();

        this._subModel.inputAssemblers[0] = {
            vertexInputState: this._vertexInputState,
            vertexInput: {
                vertexBuffers: [this._texCoordBuffer.buffer, this._positionBuffer.buffer],
                vertexOffsets: [0, 0],
                indexBuffer: this._indexBuffer.buffer,
                indexType: IndexType.UINT16,
                indexCount,
                indexOffset: 0
            }
        }

        this._dirtyFlag = DirtyFlagBits.NONE;
    }
}