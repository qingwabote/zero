import * as sc from '@esotericsoftware/spine-core';
import { Shader, bundle, render, shaderLib, vec3, vec4 } from 'engine';
import { BlendFactor, BlendState, CullMode, PassState, PrimitiveTopology, RasterizationState } from "gfx";
const ss_spine = await bundle.cache('./shaders/unlit', Shader);
class SubModelPool {
    constructor(_inputAssembler, _texture, _blend) {
        this._inputAssembler = _inputAssembler;
        this._texture = _texture;
        this._blend = _blend;
        this._free = 0;
        this._subModels = [];
    }
    get() {
        if (this._free) {
            return this._subModels[--this._free];
        }
        const subMesh = new render.SubMesh(this._inputAssembler, vec3.create(), vec3.create());
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
        pass.initialize();
        pass.setUniform('Props', 'albedo', vec4.ONE);
        pass.setTexture('albedoMap', this._texture.getImpl());
        const subModel = new render.SubModel(subMesh, [pass]);
        this._subModels.push(subModel);
        return subModel;
    }
    recycle() {
        this._free = this._subModels.length;
    }
}
export class SubModelPools {
    constructor(_inputAssembler) {
        this._inputAssembler = _inputAssembler;
        this._pools = {};
    }
    get(key, texture, blend) {
        let pool = this._pools[key];
        if (!pool) {
            pool = new SubModelPool(this._inputAssembler, texture, blend);
            this._pools[key] = pool;
        }
        return pool.get();
    }
    recycle() {
        for (const key in this._pools) {
            this._pools[key].recycle();
        }
    }
}
