// http://www.angelcode.com/products/bmfont/doc/render_text.html

import FNT from "../../assets/FNT.js";
import Asset from "../../core/Asset.js";
import { BufferUsageFlagBits } from "../../core/gfx/Buffer.js";
import { IndexType, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../../core/gfx/InputAssembler.js";
import { CullMode, FormatInfos, PassState, PrimitiveTopology } from "../../core/gfx/Pipeline.js";
import aabb2d, { AABB2D } from "../../core/math/aabb2d.js";
import vec2 from "../../core/math/vec2.js";
import BufferViewResizable from "../../core/scene/buffers/BufferViewResizable.js";
import Model from "../../core/scene/Model.js";
import Pass from "../../core/scene/Pass.js";
import SubModel from "../../core/scene/SubModel.js";
import ShaderLib from "../../core/ShaderLib.js";
import BoundedRenderer, { BoundsEvent } from "../internal/BoundedRenderer.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();

ShaderLib.preloaded.push({ name: 'zero', macros: { USE_ALBEDO_MAP: 1 } });
Asset.preloaded.push({ path: '../../assets/fnt/zero', type: FNT });

enum DirtyFlagBits {
    NONE = 0,
    TEXT = (1 << 0),
}

const lineBreak = '\n'.charCodeAt(0);

export default class TextRenderer extends BoundedRenderer {
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

    private _bounds = aabb2d.create();
    get bounds(): Readonly<AABB2D> {
        this.updateData();
        return this._bounds;
    }

    private _fnt: FNT = Asset.cache.get('../../assets/fnt/zero', FNT);

    private _texCoordBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);

    private _positionBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);

    private _indexBuffer = new BufferViewResizable("Uint16", BufferUsageFlagBits.INDEX);

    private _vertexInputState!: VertexInputState;

    private _model!: Model;

    private _inputAssemblerInvalidated = true;

    private _indexCount = 0;

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

        const pass = new Pass(new PassState(shader, PrimitiveTopology.TRIANGLE_LIST, { cullMode: CullMode.NONE }));
        pass.initialize()
        pass.setTexture('albedoMap', this._fnt.texture.gfx_texture)
        const subModel: SubModel = new SubModel([], [pass]);
        const model = new Model(this.node, [subModel]);
        zero.scene.models.push(model);
        this._model = model;
    }

    override commit(): void {
        this.updateData();

        const subModel = this._model.subModels[0];

        if (this._text.length == 0) {
            subModel.vertexOrIndexCount = 0;
            return;
        }

        this._texCoordBuffer.update();
        this._positionBuffer.update();
        this._indexBuffer.update();

        if (this._inputAssemblerInvalidated) {
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
            subModel.inputAssemblers[0] = inputAssembler;
            this._inputAssemblerInvalidated = false;
        }

        subModel.vertexOrIndexCount = this._indexCount;
    }

    private updateData(): void {
        if (this._dirtyFlag == DirtyFlagBits.NONE) {
            return;
        }

        if (this._text.length == 0) {
            aabb2d.set(this._bounds, 0, 0, 0, 0);
            this.emit(BoundsEvent.BOUNDS_CHANGED);
            this._dirtyFlag = DirtyFlagBits.NONE;
            return;
        }

        const indexCount = 6 * this._text.length;

        let reallocated = false;
        reallocated = this._texCoordBuffer.reset(2 * 4 * this._text.length) || reallocated;
        reallocated = this._positionBuffer.reset(3 * 4 * this._text.length) || reallocated;
        reallocated = this._indexBuffer.reset(indexCount) || reallocated;

        const tex = this._fnt.texture.gfx_texture.info;
        let [x, y, l, r, t, b, i] = [0, 0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0];
        while (i < this._text.length) {
            const code = this._text.charCodeAt(i);
            if (code == lineBreak) {
                x = 0;
                y -= this._fnt.common.lineHeight / BoundedRenderer.PIXELS_PER_UNIT;
                i++;
                continue;
            }

            const char = this._fnt.chars[code];
            const tex_l = char.x / tex.width;
            const tex_r = (char.x + char.width) / tex.width;
            const tex_t = char.y / tex.height;
            const tex_b = (char.y + char.height) / tex.height;

            const xoffset = char.xoffset / BoundedRenderer.PIXELS_PER_UNIT;
            const yoffset = char.yoffset / BoundedRenderer.PIXELS_PER_UNIT;
            const width = char.width / BoundedRenderer.PIXELS_PER_UNIT;
            const height = char.height / BoundedRenderer.PIXELS_PER_UNIT;

            const pos_l = x + xoffset;
            const pos_r = x + xoffset + width;
            const pos_t = y - yoffset;
            const pos_b = y - yoffset - height;

            this._texCoordBuffer.data[2 * 4 * i + 0] = tex_l;
            this._texCoordBuffer.data[2 * 4 * i + 1] = tex_t;
            this._positionBuffer.data[3 * 4 * i + 0] = pos_l;
            this._positionBuffer.data[3 * 4 * i + 1] = pos_t;
            this._positionBuffer.data[3 * 4 * i + 2] = 0;

            this._texCoordBuffer.data[2 * 4 * i + 2] = tex_r;
            this._texCoordBuffer.data[2 * 4 * i + 3] = tex_t;
            this._positionBuffer.data[3 * 4 * i + 3] = pos_r;
            this._positionBuffer.data[3 * 4 * i + 4] = pos_t;
            this._positionBuffer.data[3 * 4 * i + 5] = 0;

            this._texCoordBuffer.data[2 * 4 * i + 4] = tex_r;
            this._texCoordBuffer.data[2 * 4 * i + 5] = tex_b;
            this._positionBuffer.data[3 * 4 * i + 6] = pos_r;
            this._positionBuffer.data[3 * 4 * i + 7] = pos_b;
            this._positionBuffer.data[3 * 4 * i + 8] = 0;

            this._texCoordBuffer.data[2 * 4 * i + 6] = tex_l;
            this._texCoordBuffer.data[2 * 4 * i + 7] = tex_b;
            this._positionBuffer.data[3 * 4 * i + 9] = pos_l;
            this._positionBuffer.data[3 * 4 * i + 10] = pos_b;
            this._positionBuffer.data[3 * 4 * i + 11] = 0;

            // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
            this._indexBuffer.set([
                4 * i + 0,
                4 * i + 2,
                4 * i + 1,
                4 * i + 2,
                4 * i + 0,
                4 * i + 3
            ], 6 * i);

            l = Math.min(l, pos_l);
            r = Math.max(r, pos_r);
            t = Math.max(t, pos_t);
            b = Math.min(b, pos_b);

            x += char.xadvance / BoundedRenderer.PIXELS_PER_UNIT;
            i++;
        }

        this._indexCount = indexCount;
        // aabb2d.set(this._bounds, 0, b, r + l, t - b);
        vec2.set(vec2_a, l, b);
        vec2.set(vec2_b, r, t);
        aabb2d.fromPoints(this._bounds, vec2_a, vec2_b);

        this.emit(BoundsEvent.BOUNDS_CHANGED);
        if (reallocated) {
            this._inputAssemblerInvalidated = true;
        }

        this._dirtyFlag = DirtyFlagBits.NONE;
    }
}