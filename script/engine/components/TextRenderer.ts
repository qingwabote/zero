// http://www.angelcode.com/products/bmfont/doc/render_text.html

import { bundle } from "bundling";
import { BlendFactor, BlendState, BufferUsageFlagBits, CullMode, Format, IndexType, PassState, PrimitiveTopology, RasterizationState, VertexAttribute, VertexAttributeVector } from "gfx";
import { FNT } from "../assets/FNT.js";
import { ShaderStages } from "../assets/ShaderStages.js";
import { Zero } from "../core/Zero.js";
import { AABB2D, aabb2d } from "../core/math/aabb2d.js";
import { vec2 } from "../core/math/vec2.js";
import { vec3 } from "../core/math/vec3.js";
import { vec4 } from "../core/math/vec4.js";
import { Pass } from "../core/render/scene/Pass.js";
import { IndexInputView, SubMesh, VertexInputView } from "../core/render/scene/SubMesh.js";
import { SubModel } from "../core/render/scene/SubModel.js";
import { BufferViewWritable } from "../core/render/scene/buffers/BufferViewWritable.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer, BoundsEvent } from "./BoundedRenderer.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();

const ss_unlit = await bundle.cache('./shaders/unlit', ShaderStages);
const fnt_zero = await bundle.cache('../../assets/fnt/zero', FNT);

enum DirtyFlagBits {
    NONE = 0,
    TEXT = (1 << 0),
}

const lineBreak = '\n'.charCodeAt(0);

export class TextRenderer extends BoundedRenderer {
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

    private _fnt = fnt_zero;

    private _texCoordBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.VERTEX);

    private _positionBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.VERTEX);

    private _indexBuffer = new BufferViewWritable("Uint16", BufferUsageFlagBits.INDEX);

    private _subMesh!: SubMesh;

    private _indexCount = 0;

    override start(): void {
        const vertexAttributes = new VertexAttributeVector;
        const texCoordAttribute = new VertexAttribute;
        texCoordAttribute.name = 'a_texCoord';
        texCoordAttribute.format = Format.RG32_SFLOAT;
        texCoordAttribute.buffer = 0;
        texCoordAttribute.offset = 0;
        vertexAttributes.add(texCoordAttribute);
        const positionAttribute = new VertexAttribute;
        positionAttribute.name = 'a_position';
        positionAttribute.format = Format.RGB32_SFLOAT;
        positionAttribute.buffer = 1;
        positionAttribute.offset = 0;
        vertexAttributes.add(positionAttribute);

        const vertexInput: VertexInputView = {
            buffers: [this._texCoordBuffer, this._positionBuffer],
            offsets: [0, 0]
        }
        const indexInput: IndexInputView = {
            buffer: this._indexBuffer,
            type: IndexType.UINT16
        }
        const subMesh: SubMesh = new SubMesh(
            vertexAttributes,
            vertexInput,
            vec3.create(),
            vec3.create(),
            indexInput
        )

        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const blendState = new BlendState;
        blendState.srcRGB = BlendFactor.SRC_ALPHA;
        blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
        blendState.srcAlpha = BlendFactor.ONE;
        blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA
        const state = new PassState;
        state.shader = shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 });
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        state.blendState = blendState;

        const pass = new Pass(state);
        pass.setTexture('albedoMap', this._fnt.texture.impl)
        pass.setUniform('Constants', 'albedo', vec4.ONE)
        const subModel: SubModel = new SubModel(subMesh, [pass]);
        this._model.subModels.push(subModel);
        Zero.instance.scene.addModel(this._model)
        this._subMesh = subMesh;
    }

    override lateUpdate(): void {
        this.updateData();

        if (this._text.length == 0) {
            this._subMesh.drawInfo.count = 0;
            return;
        }

        this._texCoordBuffer.update();
        this._positionBuffer.update();
        this._indexBuffer.update();

        this._subMesh.drawInfo.count = this._indexCount;
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
                y -= this._fnt.common.lineHeight / TextRenderer.PIXELS_PER_UNIT;
                i++;
                continue;
            }

            const char = this._fnt.chars[code];
            const tex_l = char.x / tex.width;
            const tex_r = (char.x + char.width) / tex.width;
            const tex_t = char.y / tex.height;
            const tex_b = (char.y + char.height) / tex.height;

            const xoffset = char.xoffset / TextRenderer.PIXELS_PER_UNIT;
            const yoffset = char.yoffset / TextRenderer.PIXELS_PER_UNIT;
            const width = char.width / TextRenderer.PIXELS_PER_UNIT;
            const height = char.height / TextRenderer.PIXELS_PER_UNIT;

            const pos_l = x + xoffset;
            const pos_r = x + xoffset + width;
            const pos_t = y - yoffset;
            const pos_b = y - yoffset - height;

            this._texCoordBuffer.source[2 * 4 * i + 0] = tex_l;
            this._texCoordBuffer.source[2 * 4 * i + 1] = tex_t;
            this._positionBuffer.source[3 * 4 * i + 0] = pos_l;
            this._positionBuffer.source[3 * 4 * i + 1] = pos_t;
            this._positionBuffer.source[3 * 4 * i + 2] = 0;

            this._texCoordBuffer.source[2 * 4 * i + 2] = tex_r;
            this._texCoordBuffer.source[2 * 4 * i + 3] = tex_t;
            this._positionBuffer.source[3 * 4 * i + 3] = pos_r;
            this._positionBuffer.source[3 * 4 * i + 4] = pos_t;
            this._positionBuffer.source[3 * 4 * i + 5] = 0;

            this._texCoordBuffer.source[2 * 4 * i + 4] = tex_r;
            this._texCoordBuffer.source[2 * 4 * i + 5] = tex_b;
            this._positionBuffer.source[3 * 4 * i + 6] = pos_r;
            this._positionBuffer.source[3 * 4 * i + 7] = pos_b;
            this._positionBuffer.source[3 * 4 * i + 8] = 0;

            this._texCoordBuffer.source[2 * 4 * i + 6] = tex_l;
            this._texCoordBuffer.source[2 * 4 * i + 7] = tex_b;
            this._positionBuffer.source[3 * 4 * i + 9] = pos_l;
            this._positionBuffer.source[3 * 4 * i + 10] = pos_b;
            this._positionBuffer.source[3 * 4 * i + 11] = 0;

            this._texCoordBuffer.invalidate();
            this._positionBuffer.invalidate();

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

            x += char.xadvance / TextRenderer.PIXELS_PER_UNIT;
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