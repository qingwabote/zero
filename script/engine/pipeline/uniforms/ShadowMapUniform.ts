import { Filter, Texture } from "gfx";
import { Context } from "../../core/render/Context.js";
import { Uniform } from "../../core/render/pipeline/Uniform.js";
import { getSampler } from "../../core/sc.js";
import { shaderLib } from "../../core/shaderLib.js";

const shadowMap = shaderLib.sets.global.uniforms.ShadowMap;

export class ShadowMapUniform extends Uniform {
    static readonly definition = shadowMap;

    constructor(context: Context, texture: Texture) {
        super(context);

        this._context.descriptorSet.bindTexture(
            shadowMap.binding,
            texture,
            getSampler(Filter.NEAREST, Filter.NEAREST)
        );
    }

    update(): void { }
}