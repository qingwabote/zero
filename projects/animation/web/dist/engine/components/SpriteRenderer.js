import { bundle } from "bundling";
import { Filter } from "gfx";
import { Shader } from "../assets/Shader.js";
import { SpriteFrame } from "../assets/SpriteFrame.js";
import { aabb3d } from "../core/math/aabb3d.js";
import { vec4 } from "../core/math/vec4.js";
import { Model } from "../core/render/scene/Model.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { Pass } from "../scene/Pass.js";
import { BoundedRenderer } from "./BoundedRenderer.js";
const ss_unlit = await bundle.cache('./shaders/unlit', Shader);
export class SpriteRenderer extends BoundedRenderer {
    constructor() {
        super(...arguments);
        this.shader = shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 });
        this._spriteFrame_invalidated = false;
        this._spriteFrame = null;
        this.filter = Filter.NEAREST;
        this.color = vec4.ONE;
    }
    get spriteFrame() {
        return this._spriteFrame;
    }
    set spriteFrame(value) {
        this._spriteFrame = value;
        this._spriteFrame_invalidated = true;
        this.emit(BoundedRenderer.EventName.BOUNDS_CHANGED);
    }
    get bounds() {
        var _a, _b;
        return (_b = (_a = this._spriteFrame) === null || _a === void 0 ? void 0 : _a.mesh.bounds) !== null && _b !== void 0 ? _b : aabb3d.ZERO;
    }
    createModel() {
        if (!this._spriteFrame) {
            return null;
        }
        const pass = new Pass({ shader: this.shader });
        const offset = pass.getPropertyOffset('albedo');
        if (offset != -1) {
            pass.setProperty(this.color, offset);
        }
        return new Model(this.node, this._spriteFrame.mesh, [
            { passes: [pass] }
        ]);
    }
    update(dt) {
        var _a;
        super.update(dt);
        if (this._spriteFrame_invalidated) {
            ((_a = this._model) === null || _a === void 0 ? void 0 : _a.materials[0].passes[0]).setTexture('albedoMap', this._spriteFrame.texture, getSampler(this.filter, this.filter));
            this._spriteFrame_invalidated = false;
        }
    }
}
SpriteRenderer.PIXELS_PER_UNIT = SpriteFrame.PIXELS_PER_UNIT;
SpriteRenderer.Filter = Filter;
