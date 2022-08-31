import ComponentScheduler from "./ComponentScheduler.js";
import gfx from "./gfx.js";
import { BlendFactor, DescriptorSet } from "./gfx/Pipeline.js";
import Input from "./Input.js";
import Loader from "./Loader.js";
import render from "./render.js";
import RenderScene from "./render/RenderScene.js";
import RenderWindow from "./render/RenderWindow.js";
import { BuiltinDescriptorSetLayouts, BuiltinUniformBlocks } from "./shaders.js";

let _window: RenderWindow;

let _input: Input;

let _loader: Loader;

let _renderScene: RenderScene;

let _globalDescriptorSet: DescriptorSet;

let _componentScheduler = new ComponentScheduler;

export default {
    get window(): RenderWindow {
        return _window;
    },

    get input(): Input {
        return _input;
    },

    get loader(): Loader {
        return _loader;
    },

    get renderScene(): RenderScene {
        return _renderScene;
    },

    get componentScheduler(): ComponentScheduler {
        return _componentScheduler;
    },

    init(input: Input, loader: Loader, width: number, height: number) {
        _window = { width, height };

        _renderScene = new RenderScene;

        _globalDescriptorSet = { layout: BuiltinDescriptorSetLayouts.global, buffers: [], textures: [] };

        _input = input;
        _loader = loader;
    },

    tick(dt: number) {
        _componentScheduler.update(dt)

        _renderScene.update(dt);

        render.dirtyTransforms.clear();

        const cameras = _renderScene.cameras;
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            _globalDescriptorSet.buffers[BuiltinUniformBlocks.global.blocks.Camera.binding] = camera.ubo;

            const commandBuffer = gfx.device.commandBuffer;
            const viewport = camera.viewport;
            commandBuffer.beginRenderPass({
                x: _window.width * viewport.x,
                y: _window.height * viewport.y,
                width: _window.width * viewport.width,
                height: _window.height * viewport.height
            })
            commandBuffer.bindDescriptorSet(BuiltinUniformBlocks.global.set, _globalDescriptorSet);

            for (const model of _renderScene.models) {
                commandBuffer.bindDescriptorSet(BuiltinUniformBlocks.local.set, model.descriptorSet);
                for (const subModel of model.subModels) {
                    commandBuffer.bindInputAssembler(subModel.inputAssembler);
                    for (const pass of subModel.passes) {
                        const pipeline = gfx.device.createPipeline();
                        pipeline.initialize({
                            shader: pass.shader,
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
                            }
                        })
                        commandBuffer.bindPipeline(pipeline);
                        commandBuffer.bindDescriptorSet(BuiltinUniformBlocks.local.set + 1, pass.descriptorSet);
                        commandBuffer.draw();
                    }
                }
            }

            commandBuffer.endRenderPass()
        }
    }
}