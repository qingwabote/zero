import ComponentScheduler from "./ComponentScheduler.js";
import CommandBuffer from "./gfx/CommandBuffer.js";
import Fence from "./gfx/Fence.js";
import Pipeline, { DescriptorSet, PipelineInfo, PipelineLayout, PipelineStageFlagBits } from "./gfx/Pipeline.js";
import RenderPass from "./gfx/RenderPass.js";
import Semaphore from "./gfx/Semaphore.js";
import Input from "./Input.js";
import Loader from "./Loader.js";
import Platfrom from "./Platfrom.js";
import { RenderNode } from "./render/RenderNode.js";
import RenderScene from "./render/RenderScene.js";
import RenderWindow from "./render/RenderWindow.js";
import shaders, { BuiltinUniformBlocks } from "./shaders.js";

interface Frame {
    commandBuffer: CommandBuffer;
    presentSemaphore: Semaphore;
    renderSemaphore: Semaphore;
    renderFence: Fence;
}

export default class Zero {
    private _input: Input = new Input;
    get input(): Input {
        return this._input;
    }

    private _loader!: Loader;
    get loader(): Loader {
        return this._loader;
    }

    private _platfrom!: Platfrom;
    get platfrom(): Platfrom {
        return this._platfrom;
    }

    private _window!: RenderWindow;
    get window(): RenderWindow {
        return this._window;
    }

    private _renderScene!: RenderScene;
    get renderScene(): RenderScene {
        return this._renderScene;
    }

    private _frames: Frame[] = [];
    private _frameIndex: number = 0;

    private _componentScheduler: ComponentScheduler = new ComponentScheduler;
    get componentScheduler(): ComponentScheduler {
        return this._componentScheduler;
    }

    private _globalDescriptorSet!: DescriptorSet;
    get globalDescriptorSet(): DescriptorSet {
        return this._globalDescriptorSet;
    }

    private _dirtyTransforms: Map<RenderNode, RenderNode> = new Map;
    get dirtyTransforms(): Map<RenderNode, RenderNode> {
        return this._dirtyTransforms;
    }

    private _clearFlag2renderPass: Record<number, RenderPass> = {};

    private _pipelineLayoutCache: Record<string, PipelineLayout> = {};
    private _pipelineCache: Record<string, Pipeline> = {};

    initialize(loader: Loader, platfrom: Platfrom, width: number, height: number): boolean {
        this._loader = loader;

        this._platfrom = platfrom;

        this._window = { width, height };

        this._globalDescriptorSet = gfx.createDescriptorSet();
        this._globalDescriptorSet.initialize(shaders.builtinDescriptorSetLayouts.global);

        this._renderScene = new RenderScene;

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
            })
        }
        this._frameIndex = 1;

        return false;
    }

    tick(dt: number) {
        const current = this._frames[this._frameIndex];

        gfx.acquire(current.presentSemaphore);

        this._componentScheduler.update(dt)

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
            commandBuffer.beginRenderPass(
                renderPass,
                {
                    x: this._window.width * viewport.x,
                    y: this._window.height * viewport.y,
                    width: this._window.width * viewport.width,
                    height: this._window.height * viewport.height
                }
            );

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
                            ])
                            this._pipelineLayoutCache[shader.info.hash] = layout;
                        }

                        const pipelineInfo: PipelineInfo = {
                            shader,
                            vertexInputState: subModel.inputAssembler.vertexInputState,
                            layout,
                            renderPass
                        }
                        const pipelineHash = pipelineInfo.shader.info.hash + pipelineInfo.vertexInputState.hash + renderPass.info.hash;
                        let pipeline = this._pipelineCache[pipelineHash];
                        if (!pipeline) {
                            pipeline = gfx.createPipeline();
                            pipeline.initialize(pipelineInfo);
                            this._pipelineCache[pipelineHash] = pipeline;
                        }

                        commandBuffer.bindPipeline(pipeline);
                        const alignment = gfx.capabilities.uniformBufferOffsetAlignment;
                        const cameraUboSize = Math.ceil(BuiltinUniformBlocks.global.blocks.Camera.size / alignment) * alignment;
                        commandBuffer.bindDescriptorSet(layout, BuiltinUniformBlocks.global.set, this._globalDescriptorSet, [cameraIndex * cameraUboSize]);
                        commandBuffer.bindDescriptorSet(layout, BuiltinUniformBlocks.local.set, model.descriptorSet);
                        commandBuffer.bindDescriptorSet(layout, BuiltinUniformBlocks.material.set, pass.descriptorSet);

                        commandBuffer.draw();
                    }
                }
            }

            commandBuffer.endRenderPass()
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