import { bundle } from "bundling";
import { CullMode, Filter, PassState, PrimitiveTopology, RasterizationState } from "gfx";
import { Shader } from "../assets/Shader.js";
import { SpriteFrame } from "../assets/SpriteFrame.js";
import { Zero } from "../core/Zero.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
import { Material } from "../core/render/scene/Material.js";
import { Pass } from "../core/render/scene/Pass.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer, BoundsEventName } from "./BoundedRenderer.js";

const ss_unlit = await bundle.cache('./shaders/unlit', Shader);

export class SpriteRenderer extends BoundedRenderer {
    static readonly PIXELS_PER_UNIT = SpriteFrame.PIXELS_PER_UNIT;

    static readonly Filter = Filter;

    shader = shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 });;

    private _spriteFrame!: SpriteFrame;
    public get spriteFrame(): SpriteFrame {
        return this._spriteFrame;
    }
    public set spriteFrame(value: SpriteFrame) {
        this._spriteFrame = value;
        this.emit(BoundsEventName.BOUNDS_CHANGED);
    }

    filter = Filter.NEAREST;

    color: Readonly<Vec4> = vec4.ONE;

    override start(): void {
        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new PassState;
        state.shader = this.shader;
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        const pass = Pass.Pass(state);
        if (pass.hasUniform('Props', 'albedo')) {
            pass.setUniform('Props', 'albedo', this.color);
        }
        pass.setTexture('albedoMap', this._spriteFrame.texture, getSampler(this.filter, this.filter))
        this._model.mesh = this._spriteFrame.mesh;
        this._model.materials = [new Material([pass])];
        Zero.instance.scene.addModel(this._model)
    }
}