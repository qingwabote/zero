import { CullMode, Filter, PrimitiveTopology, impl } from "gfx-main";
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
import { BoundedRenderer, BoundsEvent } from "./internal/BoundedRenderer.js";

const shader_unlit = await shaderLib.load('unlit', { USE_ALBEDO_MAP: 1 })

const vec2_a = vec3.create();
const vec2_b = vec3.create();

export class SpriteRenderer extends BoundedRenderer {
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

    shader = shader_unlit;

    private _spriteFrame!: SpriteFrame;
    public get spriteFrame(): SpriteFrame {
        return this._spriteFrame;
    }
    public set spriteFrame(value: SpriteFrame) {
        this._spriteFrame = value;
        this.emit(BoundsEvent.BOUNDS_CHANGED);
    }

    color: Readonly<Vec4> = vec4.ONE;

    override start(): void {
        const rasterizationState = new impl.RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new impl.PassState;
        state.shader = this.shader;
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        const pass = new Pass(state);
        if (pass.hasUniform('Constants', 'albedo')) {
            pass.setUniform('Constants', 'albedo', this.color);
        }
        pass.setTexture('albedoMap', this._spriteFrame.texture, getSampler(Filter.NEAREST, Filter.NEAREST))
        const subModel: SubModel = new SubModel(this._spriteFrame.mesh.subMeshes[0], [pass]);
        this._model.subModels.push(subModel);
        Zero.instance.scene.addModel(this._model)
    }
}