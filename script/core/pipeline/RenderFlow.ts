import CommandBuffer from "../gfx/CommandBuffer.js";
import { DescriptorSet, DescriptorSetLayout, PipelineLayout, SampleCountFlagBits } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";
import shaders from "../shaders.js";
import PipelineUniform from "./PipelineUniform.js";
import RenderPhase from "./RenderPhase.js";
import CameraUniform from "./uniforms/CameraUniform.js";
import LightUniform from "./uniforms/LightUniform.js";
import ShadowUniform from "./uniforms/ShadowUniform.js";

const global_uniforms = shaders.sets.global.uniforms;

export default class RenderFlow {
    private _renderPhases: RenderPhase[];
    private _samples: SampleCountFlagBits;

    private _globalDescriptorSetLayout: DescriptorSetLayout;

    readonly globalDescriptorSet: DescriptorSet;

    private _uniforms: PipelineUniform[] = [];

    private _globalPipelineLayout: PipelineLayout;

    private _pipelineLayoutCache: Record<string, PipelineLayout> = {};

    constructor(renderPhases: RenderPhase[], samples: SampleCountFlagBits = SampleCountFlagBits.SAMPLE_COUNT_1) {
        const uniforms: Record<string, any> = {};
        for (const renderPhase of renderPhases) {
            Object.assign(uniforms, renderPhase.getRequestedUniforms());
        }

        const globalDescriptorSetLayout = shaders.buildDescriptorSetLayout(uniforms);

        const globalDescriptorSet = gfx.createDescriptorSet();
        globalDescriptorSet.initialize(globalDescriptorSetLayout);

        for (const key in uniforms) {
            switch (uniforms[key]) {
                case global_uniforms.Light:
                    this._uniforms.push(new LightUniform(globalDescriptorSet));
                    break;
                case global_uniforms.Camera:
                    this._uniforms.push(new CameraUniform(globalDescriptorSet));
                    break;
                case global_uniforms.Shadow:
                    this._uniforms.push(new ShadowUniform(globalDescriptorSet));
                    break;
            }
        }

        for (const renderPhase of renderPhases) {
            renderPhase.initialize(globalDescriptorSet);
        }

        const globalPipelineLayout = gfx.createPipelineLayout();
        globalPipelineLayout.initialize([globalDescriptorSetLayout]);
        this._globalPipelineLayout = globalPipelineLayout;

        this._globalDescriptorSetLayout = globalDescriptorSetLayout;

        this.globalDescriptorSet = globalDescriptorSet;
        this._renderPhases = renderPhases;
        this._samples = samples;
    }

    update() {
        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer) {
        const renderScene = zero.renderScene;
        for (let cameraIndex = 0; cameraIndex < renderScene.cameras.length; cameraIndex++) {
            const camera = renderScene.cameras[cameraIndex];
            commandBuffer.bindDescriptorSet(this._globalPipelineLayout, shaders.sets.global.set, this.globalDescriptorSet,
                [cameraIndex * shaders.sets.global.uniforms.Camera.size]);
            for (const renderPhase of this._renderPhases) {
                if ((camera.visibilities & renderPhase.visibility) == 0) {
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