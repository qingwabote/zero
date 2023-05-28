import SpriteFrame from "../assets/SpriteFrame.js";
import { PassState } from "../core/gfx/Pipeline.js";
import { Filter } from "../core/gfx/Sampler.js";
import aabb2d, { AABB2D } from "../core/math/aabb2d.js";
import vec2 from "../core/math/vec2.js";
import vec3 from "../core/math/vec3.js";
import vec4, { Vec4 } from "../core/math/vec4.js";
import samplers from "../core/samplers.js";
import Model from "../core/scene/Model.js";
import Pass from "../core/scene/Pass.js";
import SubModel from "../core/scene/SubModel.js";
import ShaderLib, { ShaderCreateInfo } from "../core/ShaderLib.js";
import BoundedRenderer, { BoundsEvent } from "./internal/BoundedRenderer.js";

const shader_unlit_info: ShaderCreateInfo = { name: 'unlit', macros: { USE_ALBEDO_MAP: 1 } };
ShaderLib.preloaded.push(shader_unlit_info);

const vec2_a = vec3.create();
const vec2_b = vec3.create();

export default class SpriteRenderer extends BoundedRenderer {
    private _model: Model | undefined;
    get model(): Model | undefined {
        return this._model;
    }

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
        const state = new PassState(ShaderLib.instance.getShader(shader_unlit_info), undefined, { cullMode: 'NONE' })
        const pass = new Pass(state);
        pass.setUniform('Constants', 'albedo', this.color)
        pass.setTexture('albedoMap', this._spriteFrame.texture.impl, samplers.get({ magFilter: Filter.NEAREST, minFilter: Filter.NEAREST }))
        const subModel: SubModel = new SubModel(this._spriteFrame.mesh.subMeshes[0], [pass]);
        const model = new Model(this.node, [subModel]);
        zero.scene.addModel(model)
        this._model = model;
    }
}