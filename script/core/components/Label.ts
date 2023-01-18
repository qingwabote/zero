// http://www.angelcode.com/products/bmfont/doc/render_text.html

import AssetCache from "../AssetCache.js";
import FNT from "../assets/FNT.js";
import Component from "../Component.js";
import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { IndexType, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../gfx/InputAssembler.js";
import { FormatInfos } from "../gfx/Pipeline.js";
import BufferViewResizable from "../render/buffers/BufferViewResizable.js";
import Model from "../render/Model.js";
import Pass from "../render/Pass.js";
import samplers from "../render/samplers.js";
import SubModel from "../render/SubModel.js";
import ShaderLib from "../ShaderLib.js";

ShaderLib.preloadedShaders.push({ name: 'zero', macros: { USE_ALBEDO_MAP: 1 } });
AssetCache.preloadedAssets.push({ path: '../../asset/fnt/zero', type: FNT });

enum DirtyFlagBits {
    NONE = 0,
    TEXT = (1 << 0),
}

const lineBreak = '\n'.charCodeAt(0);

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

    private _fnt: FNT = AssetCache.instance.get('../../asset/fnt/zero', FNT);

    private _texCoordBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);

    private _positionBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);

    private _indexBuffer = new BufferViewResizable("Uint16", BufferUsageFlagBits.INDEX);

    private _vertexInputState!: VertexInputState;

    private _subModel!: SubModel;

    override start(): void {
        const shader = ShaderLib.instance.getShader('zero', { USE_ALBEDO_MAP: 1 });

        const attributes: VertexInputAttributeDescription[] = [];
        const bindings: VertexInputBindingDescription[] = [];

        let definition = shader.info.meta.attributes["a_texCoord"];
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

        definition = shader.info.meta.attributes["a_position"];
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

        this._vertexInputState = new VertexInputState(attributes, bindings);

        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ShaderLib.instance.getDescriptorSetLayout(shader));
        descriptorSet.bindTexture(0, this._fnt.texture.gfx_texture, samplers.get());
        const pass = new Pass(shader, descriptorSet);
        const subModel: SubModel = { inputAssemblers: [], passes: [pass], vertexOrIndexCount: 0 };
        zero.renderScene.models.push(new Model([subModel], this._node));
        this._subModel = subModel;
    }

    override update(): void {
        if (this._dirtyFlag == DirtyFlagBits.NONE) {
            return;
        }
        if (this._text.length == 0) {
            this._subModel.vertexOrIndexCount = 0;
            return;
        }
        const indexCount = 6 * this._text.length;

        let reallocated = false;
        reallocated = this._texCoordBuffer.reset(2 * 4 * this._text.length) || reallocated;
        reallocated = this._positionBuffer.reset(3 * 4 * this._text.length) || reallocated;
        reallocated = this._indexBuffer.reset(indexCount) || reallocated;

        const tex = this._fnt.texture.gfx_texture.info;
        let x = 0;
        let y = 0;
        let i = 0;
        while (i < this._text.length) {
            const code = this._text.charCodeAt(i);
            if (code == lineBreak) {
                x = 0;
                y -= this._fnt.common.lineHeight;
                i++;
                continue;
            }

            const char = this._fnt.chars[code];
            const l = char.x / tex.width;
            const r = (char.x + char.width) / tex.width;
            const t = char.y / tex.height;
            const b = (char.y + char.height) / tex.height;

            x += char.xoffset;

            this._texCoordBuffer.data[2 * 4 * i + 0] = l;
            this._texCoordBuffer.data[2 * 4 * i + 1] = t;
            this._positionBuffer.data[3 * 4 * i + 0] = x;
            this._positionBuffer.data[3 * 4 * i + 1] = y - char.yoffset;
            this._positionBuffer.data[3 * 4 * i + 2] = 0;

            this._texCoordBuffer.data[2 * 4 * i + 2] = r;
            this._texCoordBuffer.data[2 * 4 * i + 3] = t;
            this._positionBuffer.data[3 * 4 * i + 3] = x + char.width;
            this._positionBuffer.data[3 * 4 * i + 4] = y - char.yoffset;
            this._positionBuffer.data[3 * 4 * i + 5] = 0;

            this._texCoordBuffer.data[2 * 4 * i + 4] = r;
            this._texCoordBuffer.data[2 * 4 * i + 5] = b;
            this._positionBuffer.data[3 * 4 * i + 6] = x + char.width;
            this._positionBuffer.data[3 * 4 * i + 7] = y - char.yoffset - char.height;
            this._positionBuffer.data[3 * 4 * i + 8] = 0;

            this._texCoordBuffer.data[2 * 4 * i + 6] = l;
            this._texCoordBuffer.data[2 * 4 * i + 7] = b;
            this._positionBuffer.data[3 * 4 * i + 9] = x;
            this._positionBuffer.data[3 * 4 * i + 10] = y - char.yoffset - char.height;
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

            i++;
        }

        this._texCoordBuffer.update();
        this._positionBuffer.update();
        this._indexBuffer.update();

        if (!this._subModel.inputAssemblers[0] || reallocated) {
            const inputAssembler = gfx.createInputAssembler();
            inputAssembler.initialize({
                vertexInputState: this._vertexInputState,
                vertexInput: {
                    vertexBuffers: [this._texCoordBuffer.buffer, this._positionBuffer.buffer],
                    vertexOffsets: [0, 0],
                },
                indexInput: {
                    indexBuffer: this._indexBuffer.buffer,
                    indexOffset: 0,
                    indexType: IndexType.UINT16,
                }
            })
            this._subModel.inputAssemblers[0] = inputAssembler;
        }

        this._subModel.vertexOrIndexCount = indexCount

        this._dirtyFlag = DirtyFlagBits.NONE;
    }
}