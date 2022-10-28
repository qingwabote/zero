import ComponentScheduler from "./ComponentScheduler.js";
import { PipelineStageFlagBits } from "./gfx/Pipeline.js";
import Input from "./Input.js";
import RenderScene from "./render/RenderScene.js";
import shaders from "./shaders.js";
export default class Zero {
    _input = new Input;
    get input() {
        return this._input;
    }
    _loader;
    get loader() {
        return this._loader;
    }
    _platfrom;
    get platfrom() {
        return this._platfrom;
    }
    _window;
    get window() {
        return this._window;
    }
    _renderScene;
    get renderScene() {
        return this._renderScene;
    }
    _frames = [];
    _frameIndex = 0;
    _componentScheduler = new ComponentScheduler;
    get componentScheduler() {
        return this._componentScheduler;
    }
    _globalDescriptorSet;
    _dirtyTransforms = new Map;
    get dirtyTransforms() {
        return this._dirtyTransforms;
    }
    _clearFlag2renderPass = {};
    _pipelineLayoutCache = {};
    _pipelineCache = {};
    initialize(loader, platfrom, width, height) {
        this._loader = loader;
        this._platfrom = platfrom;
        this._window = { width, height };
        const globalDescriptorSet = gfx.createDescriptorSet();
        globalDescriptorSet.initialize(shaders.builtinDescriptorSetLayouts.global);
        this._renderScene = new RenderScene(globalDescriptorSet);
        this._globalDescriptorSet = globalDescriptorSet;
        for (let i = 0; i < 2; i++) {
            const commandBuffer = gfx.createCommandBuffer();
            commandBuffer.initialize();
            const presentSemaphore = gfx.createSemaphore();
            presentSemaphore.initialize();
            const renderSemaphore = gfx.createSemaphore();
            renderSemaphore.initialize();
            const renderFence = gfx.createFence();
            renderFence.initialize(i == 0);
            this._frames.push({
                commandBuffer, presentSemaphore, renderSemaphore, renderFence
            });
        }
        this._frameIndex = 1;
        return false;
    }
    tick(dt) {
        const current = this._frames[this._frameIndex];
        gfx.acquire(current.presentSemaphore);
        this._componentScheduler.update(dt);
        this._renderScene.update(dt);
        this._dirtyTransforms.clear();
        const commandBuffer = current.commandBuffer;
        commandBuffer.begin();
        const cameras = this._renderScene.cameras;
        for (let cameraIndex = 0; cameraIndex < cameras.length; cameraIndex++) {
            const camera = cameras[cameraIndex];
            const viewport = camera.viewport;
            let renderPass = this._clearFlag2renderPass[camera.clearFlags];
            if (!renderPass) {
                renderPass = gfx.createRenderPass();
                renderPass.initialize({ clearFlags: camera.clearFlags, hash: camera.clearFlags.toString() });
                this._clearFlag2renderPass[camera.clearFlags] = renderPass;
            }
            commandBuffer.beginRenderPass(renderPass, {
                x: this._window.width * viewport.x,
                y: this._window.height * viewport.y,
                width: this._window.width * viewport.width,
                height: this._window.height * viewport.height
            });
            for (const model of this._renderScene.models) {
                if ((camera.visibilities & model.node.visibility) == 0) {
                    continue;
                }
                for (const subModel of model.subModels) {
                    if (!subModel.inputAssembler) {
                        continue;
                    }
                    commandBuffer.bindInputAssembler(subModel.inputAssembler);
                    for (const pass of subModel.passes) {
                        const shader = pass.shader;
                        let layout = this._pipelineLayoutCache[shader.info.hash];
                        if (!layout) {
                            layout = gfx.createPipelineLayout();
                            layout.initialize([
                                shaders.builtinDescriptorSetLayouts.global,
                                shaders.builtinDescriptorSetLayouts.local,
                                shader.info.meta.descriptorSetLayout
                            ]);
                            this._pipelineLayoutCache[shader.info.hash] = layout;
                        }
                        const pipelineInfo = {
                            shader,
                            vertexInputState: subModel.inputAssembler.vertexInputState,
                            layout,
                            renderPass
                        };
                        const pipelineHash = pipelineInfo.shader.info.hash + pipelineInfo.vertexInputState.hash + renderPass.info.hash;
                        let pipeline = this._pipelineCache[pipelineHash];
                        if (!pipeline) {
                            pipeline = gfx.createPipeline();
                            pipeline.initialize(pipelineInfo);
                            this._pipelineCache[pipelineHash] = pipeline;
                        }
                        commandBuffer.bindPipeline(pipeline);
                        commandBuffer.bindDescriptorSet(layout, shaders.builtinUniformBlocks.global.set, this._globalDescriptorSet, [cameraIndex * shaders.builtinUniformBlocks.global.blocks.Camera.size]);
                        commandBuffer.bindDescriptorSet(layout, shaders.builtinUniformBlocks.local.set, model.descriptorSet);
                        commandBuffer.bindDescriptorSet(layout, shaders.builtinUniformBlocks.material.set, pass.descriptorSet);
                        commandBuffer.draw();
                    }
                }
            }
            commandBuffer.endRenderPass();
        }
        commandBuffer.end();
        const last = this._frames[this._frameIndex > 0 ? this._frameIndex - 1 : this._frames.length - 1];
        gfx.waitFence(last.renderFence);
        gfx.submit({
            commandBuffer,
            waitDstStageMask: PipelineStageFlagBits.PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT,
            waitSemaphore: current.presentSemaphore,
            signalSemaphore: current.renderSemaphore
        }, current.renderFence);
        gfx.present(current.renderSemaphore);
        this._frameIndex = this._frameIndex < this._frames.length - 1 ? this._frameIndex + 1 : 0;
    }
}
//# sourceMappingURL=Zero.js.map