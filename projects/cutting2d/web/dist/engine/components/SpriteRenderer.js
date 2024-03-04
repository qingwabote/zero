import { bundle } from "bundling";
import { CullMode, Filter, PassState, PrimitiveTopology, RasterizationState } from "gfx";
import { Shader } from "../assets/Shader.js";
import { SpriteFrame } from "../assets/SpriteFrame.js";
import { Zero } from "../core/Zero.js";
import { vec4 } from "../core/math/vec4.js";
import { Material } from "../core/render/scene/Material.js";
import { Pass } from "../core/render/scene/Pass.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer, BoundsEventName } from "./BoundedRenderer.js";
const ss_unlit = await bundle.cache('./shaders/unlit', Shader);
export class SpriteRenderer extends BoundedRenderer {
    constructor() {
        super(...arguments);
        this.shader = shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 });
        this.filter = Filter.NEAREST;
        this.color = vec4.ONE;
    }
    ;
    get spriteFrame() {
        return this._spriteFrame;
    }
    set spriteFrame(value) {
        this._spriteFrame = value;
        this.emit(BoundsEventName.BOUNDS_CHANGED);
    }
    start() {
        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new PassState;
        state.shader = this.shader;
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        const pass = new Pass(state);
        pass.initialize();
        if (pass.hasUniform('Props', 'albedo')) {
            pass.setUniform('Props', 'albedo', this.color);
        }
        pass.setTexture('albedoMap', this._spriteFrame.texture, getSampler(this.filter, this.filter));
        this._model.mesh = this._spriteFrame.mesh;
        this._model.materials = [new Material([pass])];
        Zero.instance.scene.addModel(this._model);
    }
}
SpriteRenderer.PIXELS_PER_UNIT = SpriteFrame.PIXELS_PER_UNIT;
SpriteRenderer.Filter = Filter;
