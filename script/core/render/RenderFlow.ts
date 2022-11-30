import CommandBuffer from "../gfx/CommandBuffer.js";
import { DescriptorSet, DescriptorSetLayout, PipelineLayout, SampleCountFlagBits } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";
import shaders from "../shaders.js";
import RenderPhase from "./RenderPhase.js";
import UboGlobal from "./UboGlobal.js";

export default class RenderFlow {
    private _renderPhases: RenderPhase[];
    private _samples: SampleCountFlagBits;

    private _globalDescriptorSetLayout: DescriptorSetLayout;

    readonly globalDescriptorSet: DescriptorSet;

    private _globalPipelineLayout: PipelineLayout;

    private _pipelineLayoutCache: Record<string, PipelineLayout> = {};

    constructor(renderPhases: RenderPhase[], samples: SampleCountFlagBits = SampleCountFlagBits.SAMPLE_COUNT_1) {
        const uniforms: any = {};
        for (const renderPhase of renderPhases) {
            Object.assign(uniforms, renderPhase.getRequestedUniforms());
        }

        const globalDescriptorSetLayout = shaders.buildDescriptorSetLayout(uniforms);

        const globalDescriptorSet = gfx.createDescriptorSet();
        globalDescriptorSet.initialize(globalDescriptorSetLayout);

        for (const renderPhase of renderPhases) {
            renderPhase.initialize(globalDescriptorSet);
        }

        const globalPipelineLayout = gfx.createPipelineLayout();
        globalPipelineLayout.initialize([globalDescriptorSetLayout]);
        this._globalPipelineLayout = globalPipelineLayout;

        this._globalDescriptorSetLayout = globalDescriptorSetLayout;

        zero.renderScene.uboGlobal = new UboGlobal(globalDescriptorSet);

        this.globalDescriptorSet = globalDescriptorSet;
        this._renderPhases = renderPhases;
        this._samples = samples;
    }

    record(commandBuffer: CommandBuffer) {
        const renderScene = zero.renderScene;
        for (let cameraIndex = 0; cameraIndex < renderScene.cameras.length; cameraIndex++) {
            const camera = renderScene.cameras[cameraIndex];
            commandBuffer.bindDescriptorSet(this._globalPipelineLayout, shaders.sets.global.set, this.globalDescriptorSet,
                [cameraIndex * shaders.sets.global.uniforms.Camera.size]);
            for (const renderPhase of this._renderPhases) {
                if ((renderPhase.phase & camera.phases) == 0) {
                    continue;
                }
                renderPhase.record(commandBuffer, camera);
            }
        }
    }

    getPipelineLayout(shader: Shader): PipelineLayout {
        let layout = this._pipelineLayoutCache[shader.info.hash];
        if (!layout) {
            layout = gfx.createPipelineLayout();
            layout.initialize([
                this._globalDescriptorSetLayout,
                shaders.builtinDescriptorSetLayouts.local,
                shaders.getDescriptorSetLayout(shader)
            ])
            this._pipelineLayoutCache[shader.info.hash] = layout;
        }
        return layout;
    }
}