import { Filter } from "gfx";
import { Zero } from "../../core/Zero.js";
import { Uniform } from "../../core/render/pipeline/Uniform.js";
import { getSampler } from "../../core/sc.js";
import { shaderLib } from "../../core/shaderLib.js";
import { ShadowUniform } from "./ShadowUniform.js";

const shadowMap = shaderLib.sets.global.uniforms.ShadowMap;

export class ShadowMapUniform implements Uniform {
    readonly definition = shadowMap;

    initialize(): void {
        const shadowStage = Zero.instance.flow.stages.find((stage) => { return stage.uniforms.indexOf(ShadowUniform) != -1 })!;
        Zero.instance.flow.globalDescriptorSet.bindTexture(
            shadowMap.binding,
            shadowStage.framebuffer.info.depthStencilAttachment,
            getSampler(Filter.NEAREST, Filter.NEAREST)
        );
    }

    update(): void { }
}