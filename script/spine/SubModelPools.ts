import * as sc from '@esotericsoftware/spine-core';
import { ShaderStages, assetLib, render, shaderLib, vec3, vec4 } from 'engine';
import { BlendFactor, BlendState, CullMode, PassState, PrimitiveTopology, RasterizationState, VertexAttributeVector } from "gfx";
import { Texture } from "./Texture.js";

const ss_spine = await assetLib.cache('unlit', ShaderStages);

class SubModelPool {
    private _free = 0;
    private readonly _subModels: render.SubModel[] = [];

    constructor(
        private readonly _vertexAttributes: VertexAttributeVector,
        private readonly _vertexInput: render.VertexInputView,
        private readonly _indexInput: render.IndexInputView,
        private readonly _texture: Texture,
        private readonly _blend: sc.BlendMode) { }

    get() {
        if (this._free) {
            return this._subModels[--this._free]
        }

        const subMesh = new render.SubMesh(
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
        const pass = new render.Pass(state);
        pass.setUniform('Constants', 'albedo', vec4.ONE);
        pass.setTexture('albedoMap', this._texture.getImpl());

        const subModel = new render.SubModel(subMesh, [pass]);
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
        private readonly _vertexInput: render.VertexInputView,
        private readonly _indexInput: render.IndexInputView,
    ) { }

    get(key: string, texture: Texture, blend: sc.BlendMode): render.SubModel {
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