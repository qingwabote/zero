// http://www.angelcode.com/products/bmfont/doc/render_text.html

import { bundle } from "bundling";
import { BlendFactor, BlendState, CommandBuffer } from "gfx";
import { FNT } from "../assets/FNT.js";
import { Shader } from "../assets/Shader.js";
import { bmfont } from "../bmfont.js";
import { Node } from "../core/Node.js";
import { aabb2d } from "../core/math/aabb2d.js";
import { AABB3D } from "../core/math/aabb3d.js";
import { vec2 } from "../core/math/vec2.js";
import { vec3 } from "../core/math/vec3.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
import { Draw } from "../core/render/Draw.js";
import { quadrat } from "../core/render/Quadrat.js";
import { BufferView } from "../core/render/gfx/BufferView.js";
import { Mesh } from "../core/render/scene/Mesh.js";
import { Model } from "../core/render/scene/Model.js";
import { shaderLib } from "../core/shaderLib.js";
import { Pass } from "../scene/Pass.js";
import { BoundedRenderer } from "./BoundedRenderer.js";

const fnt = await bundle.cache('fnt/zero', FNT);

const pass = await (async function () {
    const unlit = await bundle.cache('shaders/unlit', Shader);

    const blendState = new BlendState;
    blendState.srcRGB = BlendFactor.SRC_ALPHA;
    blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = BlendFactor.ONE;
    blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;

    const pass = new Pass({ shader: shaderLib.getShader(unlit, { USE_ALBEDO_MAP: 1 }), blendState });
    pass.setTexture('albedoMap', fnt.texture.impl);
    pass.setProperty(vec4.ONE, pass.getPropertyOffset('albedo'));
    return pass;
})()

enum DirtyFlagBits {
    NONE = 0,
    TEXT = (1 << 0),
}

const vec2_a = vec2.create();
const vec2_b = vec2.create();

const vec3_a = vec3.create();
const vec3_b = vec3.create();

export class TextRenderer extends BoundedRenderer {
    private _dirties: DirtyFlagBits = DirtyFlagBits.TEXT;

    private _pass = pass.copy()

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

    private _color = vec4.create(1, 1, 1, 1);
    public get color(): Readonly<Vec4> {
        return this._color;
    }
    public set color(value: Readonly<Vec4>) {
        this._pass.setProperty(value, this._pass.getPropertyOffset('albedo'));
        vec4.copy(this._color, value);
    }

    private _size: number = fnt.info.size;
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

        const vertexView = quadrat.createVertexBufferView();
        const subMesh: Draw = new Draw(quadrat.createInputAssembler(vertexView.buffer));

        this._mesh = new Mesh([subMesh]);
        this._vertexView = vertexView;
    }

    protected createModel(): Model | null {
        return new Model(this.node, this._mesh, [
            { passes: [this._pass] }
        ])
    }

    override lateUpdate(): void {
        this.updateData();
    }

    override upload(commandBuffer: CommandBuffer): void {
        this._vertexView.update(commandBuffer);
        this._mesh.subMeshes[0].range.count = 6 * this._quads;
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

        this._quads = bmfont.mesh(this._vertexView.reset(), vec3_a, vec3_b, fnt, this._text, TextRenderer.PIXELS_PER_UNIT / (this._size / fnt.info.size));
        quadrat.reserve(this._quads);

        this._dirties = DirtyFlagBits.NONE;

        aabb2d.toExtremes(vec2_a, vec2_b, this._mesh.bounds);
        if (!vec2.equals(vec2_a, vec3_a) || !vec2.equals(vec2_b, vec3_b)) {
            this._mesh.setBoundsByExtremes(vec3_a, vec3_b)
            this.emit(BoundedRenderer.EventName.BOUNDS_CHANGED);
        }
    }
}