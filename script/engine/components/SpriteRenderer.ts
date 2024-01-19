import { bundle } from "bundling";
import { CullMode, Filter, PassState, PrimitiveTopology, RasterizationState } from "gfx";
import { Shader } from "../assets/Shader.js";
import { SpriteFrame } from "../assets/SpriteFrame.js";
import { Zero } from "../core/Zero.js";
import { AABB2D, aabb2d } from "../core/math/aabb2d.js";
import { vec2 } from "../core/math/vec2.js";
import { vec3 } from "../core/math/vec3.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
import { Pass } from "../core/render/scene/Pass.js";
import { SubModel } from "../core/render/scene/SubModel.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer, BoundsEventName } from "./BoundedRenderer.js";

const ss_unlit = await bundle.cache('./shaders/unlit', Shader);

const vec2_a = vec3.create();
const vec2_b = vec3.create();

export class SpriteRenderer extends BoundedRenderer {
    static readonly PIXELS_PER_UNIT = SpriteFrame.PIXELS_PER_UNIT;

    static readonly Filter = Filter;

    private _bounds = aabb2d.create();
    public get bounds(): Readonly<AABB2D> {
        const mesh = this._spriteFrame.mesh;
        vec2.copy(vec2_a, mesh.subMeshes[0].vertexPositionMin)
        vec2.copy(vec2_b, mesh.subMeshes[0].vertexPositionMax)
        for (let i = 1; i < mesh.subMeshes.length; i++) {
            vec2.min(vec2_a, vec2_a, mesh.subMeshes[i].vertexPositionMin);
            vec2.max(vec2_b, vec2_b, mesh.subMeshes[i].vertexPositionMax);
        }
        return aabb2d.fromPoints(this._bounds, vec2_a, vec2_b);
    }

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
        const pass = new Pass(state);
        pass.initialize();
        if (pass.hasUniform('Props', 'albedo')) {
            pass.setUniform('Props', 'albedo', this.color);
        }
        pass.setTexture('albedoMap', this._spriteFrame.texture, getSampler(this.filter, this.filter))
        const subModel: SubModel = new SubModel(this._spriteFrame.mesh.subMeshes[0], [pass]);
        this._model.subModels.push(subModel);
        Zero.instance.scene.addModel(this._model)
    }
}