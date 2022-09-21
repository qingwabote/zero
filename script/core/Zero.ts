import ComponentScheduler from "./ComponentScheduler.js";
import Device from "./gfx/Device.js";
import { BlendFactor, DescriptorSet } from "./gfx/Pipeline.js";
import Input from "./Input.js";
import Loader from "./Loader.js";
import render from "./render.js";
import RenderScene from "./render/RenderScene.js";
import RenderWindow from "./render/RenderWindow.js";
import shaders, { BuiltinUniformBlocks } from "./shaders.js";

export default class Zero {
    private _device!: Device;
    get device(): Device {
        return this._device;
    }

    private _window!: RenderWindow;
    get window(): RenderWindow {
        return this._window;
    }

    private _input: Input = new Input;
    get input(): Input {
        return this._input;
    }

    private _loader!: Loader;
    get loader(): Loader {
        return this._loader;
    }

    private _renderScene!: RenderScene;
    get renderScene(): RenderScene {
        return this._renderScene;
    }

    private _componentScheduler: ComponentScheduler = new ComponentScheduler;
    get componentScheduler(): ComponentScheduler {
        return this._componentScheduler;
    }

    private _globalDescriptorSet!: DescriptorSet;
    get globalDescriptorSet(): DescriptorSet {
        return this._globalDescriptorSet;
    }

    initialize(device: Device, loader: Loader, width: number, height: number): boolean {
        if (device.initialize()) {
            return true;
        }
        this._device = device;

        this._loader = loader;

        this._window = { width, height };

        this._globalDescriptorSet = device.createDescriptorSet();
        this._globalDescriptorSet.initialize(shaders.builtinDescriptorSetLayouts.global);

        this._renderScene = new RenderScene;

        return false;
    }

    tick(dt: number) {
        this._componentScheduler.update(dt)

        this._renderScene.update(dt);

        render.dirtyTransforms.clear();

        const commandBuffer = this._device.commandBuffer;
        commandBuffer.begin();

        const cameras = this._renderScene.cameras;
        for (let cameraIndex = 0; cameraIndex < cameras.length; cameraIndex++) {
            const camera = cameras[cameraIndex];
            const viewport = camera.viewport;
            commandBuffer.beginRenderPass({
                x: this._window.width * viewport.x,
                y: this._window.height * viewport.y,
                width: this._window.width * viewport.width,
                height: this._window.height * viewport.height
            })

            for (const model of this._renderScene.models) {
                for (const subModel of model.subModels) {
                    commandBuffer.bindInputAssembler(subModel.inputAssembler);
                    for (const pass of subModel.passes) {
                        const shader = pass.shader;

                        const layout = zero.device.createPipelineLayout();
                        layout.initialize([
                            shaders.builtinDescriptorSetLayouts.global,
                            shaders.builtinDescriptorSetLayouts.local,
                            shader.info.meta.descriptorSetLayout
                        ])
                        const pipeline = this._device.createPipeline();
                        pipeline.initialize({
                            shader,
                            vertexInputState: {
                                bindings: subModel.inputAssembler.bindings,
                                attributes: subModel.inputAssembler.attributes
                            },
                            depthStencilState: { depthTest: true },
                            blendState: {
                                blends: [
                                    {
                                        blend: false,
                                        srcRGB: BlendFactor.ONE,
                                        dstRGB: BlendFactor.ZERO,
                                        srcAlpha: BlendFactor.ONE,
                                        dstAlpha: BlendFactor.ZERO
                                    }]
                            },
                            layout
                        })
                        commandBuffer.bindPipeline(pipeline);
                        const alignment = zero.device.capabilities.uniformBufferOffsetAlignment;
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

        this._device.present();
    }
} 