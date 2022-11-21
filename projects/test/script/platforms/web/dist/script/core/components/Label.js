// http://www.angelcode.com/products/bmfont/doc/render_text.html
import Component from "../Component.js";
import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { FormatInfos, IndexType, VertexInputRate } from "../gfx/Pipeline.js";
import BufferViewResizable from "../render/BufferViewResizable.js";
import Model from "../render/Model.js";
import Pass from "../render/Pass.js";
import shaders from "../shaders.js";
var DirtyFlagBits;
(function (DirtyFlagBits) {
    DirtyFlagBits[DirtyFlagBits["NONE"] = 0] = "NONE";
    DirtyFlagBits[DirtyFlagBits["TEXT"] = 1] = "TEXT";
})(DirtyFlagBits || (DirtyFlagBits = {}));
export default class Label extends Component {
    _dirtyFlag = DirtyFlagBits.TEXT;
    _text = "";
    get text() {
        return this._text;
    }
    set text(value) {
        if (this._text == value) {
            return;
        }
        this._text = value;
        this._dirtyFlag |= DirtyFlagBits.TEXT;
    }
    _fnt;
    get fnt() {
        return this._fnt;
    }
    set fnt(value) {
        this._fnt = value;
    }
    _shader;
    get shader() {
        return this._shader;
    }
    set shader(value) {
        this._shader = value;
    }
    _texCoordBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);
    _positionBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);
    _indexBuffer = new BufferViewResizable("Uint16", BufferUsageFlagBits.INDEX);
    _vertexInputState;
    _subModel;
    start() {
        const attributes = [];
        const bindings = [];
        let definition = this._shader.info.meta.attributes["a_texCoord"];
        let attribute = {
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
        });
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
        });
        this._vertexInputState = { attributes, bindings, hash: "Label" };
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(shaders.getDescriptorSetLayout(this._shader));
        descriptorSet.bindTexture(0, this._fnt.texture.gfx_texture);
        const pass = new Pass(descriptorSet, this._shader);
        const subModel = { inputAssemblers: [], passes: [pass] };
        const model = new Model([subModel], this._node);
        zero.renderScene.models.push(model);
        this._subModel = subModel;
    }
    update(dt) {
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
        this._indexBuffer.reset(indexCount);
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
            ], 6 * i);
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
        };
        this._dirtyFlag = DirtyFlagBits.NONE;
    }
}
//# sourceMappingURL=Label.js.map