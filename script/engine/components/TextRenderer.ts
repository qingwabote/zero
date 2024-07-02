// http://www.angelcode.com/products/bmfont/doc/render_text.html

import { bundle } from "bundling";
import { BlendFactor, BlendState, PassState, PrimitiveTopology } from "gfx";
import { FNT } from "../assets/FNT.js";
import { Shader } from "../assets/Shader.js";
import { Node } from "../core/Node.js";
import { aabb2d } from "../core/math/aabb2d.js";
import { AABB3D } from "../core/math/aabb3d.js";
import { vec2 } from "../core/math/vec2.js";
import { vec3 } from "../core/math/vec3.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
import { BufferView, Material, Mesh } from "../core/render/index.js";
import { quad } from "../core/render/quad.js";
import { Model } from "../core/render/scene/Model.js";
import { Pass } from "../core/render/scene/Pass.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer } from "./BoundedRenderer.js";

const fnt_zero = await bundle.cache('fnt/zero', FNT);

const default_color = vec4.ONE;

const pass = await (async function () {
    const ss_unlit = await bundle.cache('shaders/unlit', Shader);

    const blendState = new BlendState;
    blendState.srcRGB = BlendFactor.SRC_ALPHA;
    blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = BlendFactor.ONE;
    blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;

    const state = new PassState;
    state.shader = shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 });
    state.primitive = PrimitiveTopology.TRIANGLE_LIST;
    state.blendState = blendState;

    const pass = Pass.Pass(state);
    pass.setTexture('albedoMap', fnt_zero.texture.impl);
    pass.setProperty(default_color, pass.getPropertyOffset('albedo'));
    return pass;
})()

enum DirtyFlagBits {
    NONE = 0,
    TEXT = (1 << 0),
}

const lineBreak = '\n'.charCodeAt(0);

const vec2_a = vec2.create();
const vec2_b = vec2.create();

const vec3_a = vec3.create();
const vec3_b = vec3.create();

export class TextRenderer extends BoundedRenderer {
    private _dirties: DirtyFlagBits = DirtyFlagBits.TEXT;

    private _pass = pass.instantiate()

    private _text: string = "";
    get text(): string {
        return this._text;
    }
    set text(value: string) {
        if (this._text == value) {
            return;
        }
        this._text = value;
        this._dirties |= DirtyFlagBits.TEXT;
    }

    private _color = default_color;
    public get color(): Readonly<Vec4> {
        return this._color;
    }
    public set color(value: Readonly<Vec4>) {
        this._pass.setProperty(value, this._pass.getPropertyOffset('albedo'));
        this._color = value;
    }

    private _size: number = fnt_zero.info.size;
    public get size(): number {
        return this._size;
    }
    public set size(value: number) {
        if (this._size == value) {
            return;
        }
        this._size = value;
        this._dirties |= DirtyFlagBits.TEXT;
    }

    private _vertexView: BufferView;

    private _mesh: Mesh;

    private _quads = 0;

    public get bounds(): Readonly<AABB3D> {
        return this._mesh.bounds;
    }

    constructor(node: Node) {
        super(node);

        const vertexView = quad.createVertexBufferView();
        const subMesh: SubMesh = new SubMesh(quad.createInputAssembler(vertexView.buffer));

        this._mesh = new Mesh([subMesh]);
        this._vertexView = vertexView;
    }

    protected createModel(): Model | null {
        return new Model(this.node, this._mesh, [new Material([this._pass])])
    }

    override lateUpdate(): void {
        this.updateData();
    }

    override upload(): void {
        this._vertexView.update();
        this._mesh.subMeshes[0].draw.count = 6 * this._quads;
    }

    private updateData(): void {
        if (this._dirties == DirtyFlagBits.NONE) {
            return;
        }

        if (!this._text) {
            this._quads = 0;

            this._dirties = DirtyFlagBits.NONE;

            aabb2d.toExtremes(vec2_a, vec2_b, this._mesh.bounds);
            if (!vec2.equals(vec2_a, vec3.ZERO) || !vec2.equals(vec2_b, vec3.ZERO)) {
                this._mesh.setBoundsByExtremes(vec3.ZERO, vec3.ZERO)
                this.emit(BoundedRenderer.EventName.BOUNDS_CHANGED);
            }

            return;
        }

        // just a redundant size
        this._vertexView.reset(4 * 4 * this._text.length);

        const tex = fnt_zero.texture.impl.info;
        let [x, y, l, r, t, b, quads, scale] = [0, 0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, this._size / fnt_zero.info.size];
        for (let i = 0; i < this._text.length; i++) {
            const code = this._text.charCodeAt(i);
            if (code == lineBreak) {
                x = 0;
                y -= fnt_zero.common.lineHeight / TextRenderer.PIXELS_PER_UNIT * scale;
                continue;
            }

            const char = fnt_zero.chars[code];
            if (!char) {
                console.warn(`char ${this._text[i]} does not exist in fnt`);
                continue;
            }
            const tex_l = char.x / tex.width;
            const tex_r = (char.x + char.width) / tex.width;
            const tex_t = char.y / tex.height;
            const tex_b = (char.y + char.height) / tex.height;

            const xoffset = char.xoffset / TextRenderer.PIXELS_PER_UNIT * scale;
            const yoffset = char.yoffset / TextRenderer.PIXELS_PER_UNIT * scale;
            const width = char.width / TextRenderer.PIXELS_PER_UNIT * scale;
            const height = char.height / TextRenderer.PIXELS_PER_UNIT * scale;

            const pos_l = x + xoffset;
            const pos_r = x + xoffset + width;
            const pos_t = y - yoffset;
            const pos_b = y - yoffset - height;

            this._vertexView.source[16 * quads + 0] = pos_l;
            this._vertexView.source[16 * quads + 1] = pos_t;
            this._vertexView.source[16 * quads + 2] = tex_l;
            this._vertexView.source[16 * quads + 3] = tex_t;

            this._vertexView.source[16 * quads + 4] = pos_l;
            this._vertexView.source[16 * quads + 5] = pos_b;
            this._vertexView.source[16 * quads + 6] = tex_l;
            this._vertexView.source[16 * quads + 7] = tex_b;

            this._vertexView.source[16 * quads + 8] = pos_r;
            this._vertexView.source[16 * quads + 9] = pos_b;
            this._vertexView.source[16 * quads + 10] = tex_r;
            this._vertexView.source[16 * quads + 11] = tex_b;

            this._vertexView.source[16 * quads + 12] = pos_r;
            this._vertexView.source[16 * quads + 13] = pos_t;
            this._vertexView.source[16 * quads + 14] = tex_r;
            this._vertexView.source[16 * quads + 15] = tex_t;

            this._vertexView.invalidate();

            l = Math.min(l, pos_l);
            r = Math.max(r, pos_r);
            t = Math.max(t, pos_t);
            b = Math.min(b, pos_b);

            x += char.xadvance / TextRenderer.PIXELS_PER_UNIT * scale;

            quads++;
        }

        quad.indexGrowTo(this._quads = quads);

        vec2.set(vec3_a, l, b);
        vec2.set(vec3_b, r, t);

        this._dirties = DirtyFlagBits.NONE;

        aabb2d.toExtremes(vec2_a, vec2_b, this._mesh.bounds);
        if (!vec2.equals(vec2_a, vec3_a) || !vec2.equals(vec2_b, vec3_b)) {
            this._mesh.setBoundsByExtremes(vec3_a, vec3_b)
            this.emit(BoundedRenderer.EventName.BOUNDS_CHANGED);
        }
    }
}