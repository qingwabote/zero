// http://www.angelcode.com/products/bmfont/doc/render_text.html
import { bundle } from "bundling";
import { BlendFactor, BlendState, CullMode, PassState, PrimitiveTopology, RasterizationState } from "gfx";
import { PassInstance } from "../PassInstance.js";
import { FNT } from "../assets/FNT.js";
import { Shader } from "../assets/Shader.js";
import { Zero } from "../core/Zero.js";
import { vec2 } from "../core/math/vec2.js";
import { vec3 } from "../core/math/vec3.js";
import { vec4 } from "../core/math/vec4.js";
import { Material, Mesh } from "../core/render/index.js";
import { quad } from "../core/render/quad.js";
import { Pass } from "../core/render/scene/Pass.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer, BoundsEventName } from "./BoundedRenderer.js";
const fnt_zero = await bundle.cache('fnt/zero', FNT);
const pass = await (async function () {
    const ss_unlit = await bundle.cache('shaders/unlit', Shader);
    const rasterizationState = new RasterizationState;
    rasterizationState.cullMode = CullMode.NONE;
    const blendState = new BlendState;
    blendState.srcRGB = BlendFactor.SRC_ALPHA;
    blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = BlendFactor.ONE;
    blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;
    const state = new PassState;
    state.shader = shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 });
    state.primitive = PrimitiveTopology.TRIANGLE_LIST;
    state.rasterizationState = rasterizationState;
    state.blendState = blendState;
    const pass = new Pass(state);
    pass.initialize();
    pass.setTexture('albedoMap', fnt_zero.texture.impl);
    return pass;
})();
var DirtyFlagBits;
(function (DirtyFlagBits) {
    DirtyFlagBits[DirtyFlagBits["NONE"] = 0] = "NONE";
    DirtyFlagBits[DirtyFlagBits["TEXT"] = 1] = "TEXT";
})(DirtyFlagBits || (DirtyFlagBits = {}));
const lineBreak = '\n'.charCodeAt(0);
const vec3_a = vec3.create();
const vec3_b = vec3.create();
export class TextRenderer extends BoundedRenderer {
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
    get color() {
        return this._color;
    }
    set color(value) {
        this._pass.setUniform('Props', 'albedo', value);
        this._color = value;
    }
    constructor(node) {
        super(node);
        this._dirtyFlag = DirtyFlagBits.TEXT;
        this._pass = (function () {
            const instance = new PassInstance(pass);
            instance.initialize();
            return instance;
        })();
        this._text = "";
        this._color = vec4.ONE;
        this._quads = 0;
        const vertexView = quad.createVertexBufferView();
        const subMesh = new SubMesh(quad.createInputAssembler(vertexView.buffer));
        const mesh = new Mesh([subMesh]);
        this._model.mesh = mesh;
        this._mesh = mesh;
        this._vertexView = vertexView;
    }
    start() {
        this._pass.setUniform('Props', 'albedo', this._color);
        this._model.materials = [new Material([this._pass])];
        Zero.instance.scene.addModel(this._model);
    }
    lateUpdate() {
        this.updateData();
        this._vertexView.update();
        this._mesh.subMeshes[0].drawInfo.count = 6 * this._quads;
    }
    updateData() {
        if (this._dirtyFlag == DirtyFlagBits.NONE) {
            return;
        }
        if (!this._text) {
            this._quads = 0;
            this._mesh.setBoundsByPoints(vec3.ZERO, vec3.ZERO);
            this._dirtyFlag = DirtyFlagBits.NONE;
            this.emit(BoundsEventName.BOUNDS_CHANGED);
            return;
        }
        // just a redundant size
        this._vertexView.reset(4 * 4 * this._text.length);
        const tex = fnt_zero.texture.impl.info;
        let [x, y, l, r, t, b, quads] = [0, 0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0];
        for (let i = 0; i < this._text.length; i++) {
            const code = this._text.charCodeAt(i);
            if (code == lineBreak) {
                x = 0;
                y -= fnt_zero.common.lineHeight / TextRenderer.PIXELS_PER_UNIT;
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
            const xoffset = char.xoffset / TextRenderer.PIXELS_PER_UNIT;
            const yoffset = char.yoffset / TextRenderer.PIXELS_PER_UNIT;
            const width = char.width / TextRenderer.PIXELS_PER_UNIT;
            const height = char.height / TextRenderer.PIXELS_PER_UNIT;
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
            x += char.xadvance / TextRenderer.PIXELS_PER_UNIT;
            quads++;
        }
        quad.indexGrowTo(this._quads = quads);
        // aabb2d.set(this._bounds, 0, b, r + l, t - b);
        vec2.set(vec3_a, l, b);
        vec2.set(vec3_b, r, t);
        this._mesh.setBoundsByPoints(vec3_a, vec3_b);
        this._dirtyFlag = DirtyFlagBits.NONE;
        this.emit(BoundsEventName.BOUNDS_CHANGED);
    }
}
