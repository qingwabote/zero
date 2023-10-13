import * as sc from '@esotericsoftware/spine-core';
import { BlendFactor, BlendState, CullMode, PassState, PrimitiveTopology, RasterizationState, VertexAttributeVector } from "gfx";
import { ShaderStages } from '../../assets/ShaderStages.js';
import { assetLib } from '../../core/assetLib.js';
import { vec3 } from "../../core/math/vec3.js";
import { vec4 } from "../../core/math/vec4.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { IndexInputView, SubMesh, VertexInputView } from "../../core/render/scene/SubMesh.js";
import { SubModel } from "../../core/render/scene/SubModel.js";
import { shaderLib } from "../../core/shaderLib.js";
import { Texture } from "../Texture.js";

const ss_spine = await assetLib.cache('unlit', ShaderStages);

class SubModelPool {
    private _free = 0;
    private readonly _subModels: SubModel[] = [];

    constructor(
        private readonly _vertexAttributes: VertexAttributeVector,
        private readonly _vertexInput: VertexInputView,
        private readonly _indexInput: IndexInputView,
        private readonly _texture: Texture,
        private readonly _blend: sc.BlendMode) { }

    get() {
        if (this._free) {
            return this._subModels[--this._free]
        }

        const subMesh = new SubMesh(
            this._vertexAttributes,
            this._vertexInput,
            vec3.create(),
            vec3.create(),
            this._indexInput,
        )
        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new PassState();
        state.shader = shaderLib.getShader(ss_spine, { USE_ALBEDO_MAP: 1 });
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        switch (this._blend) {
            case sc.BlendMode.Normal:
                const blendState = new BlendState;
                blendState.srcRGB = BlendFactor.ONE; // premultipliedAlpha
                blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
                blendState.srcAlpha = BlendFactor.ONE;
                blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;
                state.blendState = blendState;
                break;

            default:
                break;
        }
        const pass = new Pass(state);
        pass.setUniform('Constants', 'albedo', vec4.ONE);
        pass.setTexture('albedoMap', this._texture.getImpl());

        const subModel = new SubModel(subMesh, [pass]);
        this._subModels.push(subModel);

        return subModel;
    }

    recycle() {
        this._free = this._subModels.length
    }
}

export class SubModelPools {
    private _pools: Record<string, SubModelPool> = {};

    constructor(
        private readonly _vertexAttributes: VertexAttributeVector,
        private readonly _vertexInput: VertexInputView,
        private readonly _indexInput: IndexInputView,
    ) { }

    get(key: string, texture: Texture, blend: sc.BlendMode): SubModel {
        let pool = this._pools[key];
        if (!pool) {
            pool = new SubModelPool(this._vertexAttributes, this._vertexInput, this._indexInput, texture, blend);
            this._pools[key] = pool;
        }
        return pool.get();
    }

    recycle() {
        for (const key in this._pools) {
            this._pools[key].recycle()
        }
    }
}