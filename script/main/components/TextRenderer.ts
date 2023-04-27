// http://www.angelcode.com/products/bmfont/doc/render_text.html

import FNT from "../assets/FNT.js";
import AssetLib from "../core/AssetLib.js";
import { BufferUsageFlagBits } from "../core/gfx/Buffer.js";
import Format from "../core/gfx/Format.js";
import { IndexType } from "../core/gfx/InputAssembler.js";
import { BlendFactor, CullMode } from "../core/gfx/Pipeline.js";
import aabb2d, { AABB2D } from "../core/math/aabb2d.js";
import vec2 from "../core/math/vec2.js";
import vec3 from "../core/math/vec3.js";
import vec4 from "../core/math/vec4.js";
import BufferViewResizable from "../core/scene/buffers/BufferViewResizable.js";
import Model from "../core/scene/Model.js";
import Pass from "../core/scene/Pass.js";
import SubMesh, { IndexInputView, PIXELS_PER_UNIT, VertexAttribute, VertexInputView } from "../core/scene/SubMesh.js";
import SubModel from "../core/scene/SubModel.js";
import ShaderLib, { ShaderCreateInfo } from "../core/ShaderLib.js";
import BoundedRenderer, { BoundsEvent } from "./internal/BoundedRenderer.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();

const shader_unlit_info: ShaderCreateInfo = { name: 'unlit', macros: { USE_ALBEDO_MAP: 1 } };
ShaderLib.preloaded.push(shader_unlit_info);

const fnt_zero_info = { path: '../../assets/fnt/zero', type: FNT };
AssetLib.preloaded.push(fnt_zero_info);

enum DirtyFlagBits {
    NONE = 0,
    TEXT = (1 << 0),
}

const lineBreak = '\n'.charCodeAt(0);

export default class TextRenderer extends BoundedRenderer {
    private _model: Model | undefined;
    get model(): Model | undefined {
        return this._model;
    }

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

    private _fnt: FNT = AssetLib.instance.get(fnt_zero_info);

    private _texCoordBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);

    private _positionBuffer = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);

    private _indexBuffer = new BufferViewResizable("Uint16", BufferUsageFlagBits.INDEX);

    private _subMesh!: SubMesh;

    private _indexCount = 0;

    override start(): void {
        const vertexAttributes: VertexAttribute[] = [
            { name: 'a_texCoord', format: Format.RG32_SFLOAT, buffer: 0, offset: 0 },
            { name: 'a_position', format: Format.RGB32_SFLOAT, buffer: 1, offset: 0 },
        ];
        const vertexInput: VertexInputView = {
            buffers: [this._texCoordBuffer, this._positionBuffer],
            offsets: [0, 0]
        }
        const indexInput: IndexInputView = {
            buffer: this._indexBuffer,
            offset: 0,
            type: IndexType.UINT16
        }
        const subMesh: SubMesh = {
            vertexAttributes,
            vertexInput,
            vertexPositionMin: vec3.create(),
            vertexPositionMax: vec3.create(),
            indexInput,
            vertexOrIndexCount: 0
        }

        const pass = new Pass({
            shader: ShaderLib.instance.getShader(shader_unlit_info),
            rasterizationState: { cullMode: CullMode.NONE },
            blendState: {
                srcRGB: BlendFactor.SRC_ALPHA,
                dstRGB: BlendFactor.ONE_MINUS_SRC_ALPHA,
                srcAlpha: BlendFactor.ONE,
                dstAlpha: BlendFactor.ONE_MINUS_SRC_ALPHA
            }
        });
        pass.setTexture('albedoMap', this._fnt.texture.impl)
        pass.setUniform('Constants', 'albedo', vec4.ONE)
        const subModel: SubModel = new SubModel(subMesh, [pass]);
        const model = new Model(this.node, [subModel]);
        zero.scene.addModel(model)
        this._model = model;
        this._subMesh = subMesh;
    }

    override lateUpdate(): void {
        this.updateData();

        if (this._text.length == 0) {
            this._subMesh.vertexOrIndexCount = 0;
            return;
        }

        this._texCoordBuffer.update();
        this._positionBuffer.update();
        this._indexBuffer.update();

        this._subMesh.vertexOrIndexCount = this._indexCount;
    }

    private updateData(): void {
        if (this._dirtyFlag == DirtyFlagBits.NONE) {
            return;
        }

        if (this._text.length == 0) {
            aabb2d.set(this._bounds, vec2.ZERO, vec2.ZERO);
            this.emit(BoundsEvent.BOUNDS_CHANGED);
            this._dirtyFlag = DirtyFlagBits.NONE;
            return;
        }

        const indexCount = 6 * this._text.length;

        this._texCoordBuffer.reset(2 * 4 * this._text.length);
        this._positionBuffer.reset(3 * 4 * this._text.length);
        this._indexBuffer.reset(indexCount);

        const tex = this._fnt.texture.impl.info;
        let [x, y, l, r, t, b, i] = [0, 0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0];
        while (i < this._text.length) {
            const code = this._text.charCodeAt(i);
            if (code == lineBreak) {
                x = 0;
                y -= this._fnt.common.lineHeight / PIXELS_PER_UNIT;
                i++;
                continue;
            }

            const char = this._fnt.chars[code];
            const tex_l = char.x / tex.width;
            const tex_r = (char.x + char.width) / tex.width;
            const tex_t = char.y / tex.height;
            const tex_b = (char.y + char.height) / tex.height;

            const xoffset = char.xoffset / PIXELS_PER_UNIT;
            const yoffset = char.yoffset / PIXELS_PER_UNIT;
            const width = char.width / PIXELS_PER_UNIT;
            const height = char.height / PIXELS_PER_UNIT;

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

            x += char.xadvance / PIXELS_PER_UNIT;
            i++;
        }

        this._indexCount = indexCount;
        // aabb2d.set(this._bounds, 0, b, r + l, t - b);
        vec2.set(vec2_a, l, b);
        vec2.set(vec2_b, r, t);
        aabb2d.fromPoints(this._bounds, vec2_a, vec2_b);

        this.emit(BoundsEvent.BOUNDS_CHANGED);

        this._dirtyFlag = DirtyFlagBits.NONE;
    }
}