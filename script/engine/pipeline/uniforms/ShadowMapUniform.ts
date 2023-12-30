import { Filter } from "gfx";
import { Flow } from "../../core/render/pipeline/Flow.js";
import { Uniform } from "../../core/render/pipeline/Uniform.js";
import { getSampler } from "../../core/sc.js";
import { shaderLib } from "../../core/shaderLib.js";

const shadowMap = shaderLib.sets.global.uniforms.ShadowMap;

export class ShadowMapUniform implements Uniform {
    readonly definition = shadowMap;

    initialize(flow: Flow): void {
        const shadowStage = flow.stages.find((stage) => { return stage.name == 'shadow' })!;
        flow.descriptorSet.bindTexture(
            shadowMap.binding,
            shadowStage.framebuffer.info.depthStencil,
            getSampler(Filter.NEAREST, Filter.NEAREST)
        );
    }

    update(): void { }
}