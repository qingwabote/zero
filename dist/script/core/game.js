import ComponentScheduler from "./ComponentScheduler.js";
import gfx from "./gfx.js";
import { BlendFactor, BuiltinDescriptorSetLayouts, BuiltinUniformBlocks } from "./gfx/Pipeline.js";
import render from "./render.js";
import RenderScene from "./render/RenderScene.js";
let _window;
let _input;
let _renderScene;
let _globalDescriptorSet;
let _componentScheduler = new ComponentScheduler;
export default {
    get window() {
        return _window;
    },
    get input() {
        return _input;
    },
    get renderScene() {
        return _renderScene;
    },
    get componentScheduler() {
        return _componentScheduler;
    },
    init(input, width, height) {
        _window = { width, height };
        _input = input;
        _renderScene = new RenderScene;
        _globalDescriptorSet = { layout: BuiltinDescriptorSetLayouts.global, buffers: [], textures: [] };
    },
    tick(dt) {
        _componentScheduler.update(dt);
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
            });
            commandBuffer.bindDescriptorSet(BuiltinUniformBlocks.global.set, _globalDescriptorSet);
            for (const model of _renderScene.models) {
                commandBuffer.bindDescriptorSet(BuiltinUniformBlocks.local.set, model.descriptorSet);
                for (const subModel of model.subModels) {
                    commandBuffer.bindInputAssembler(subModel.inputAssembler);
                    for (const pass of subModel.passes) {
                        const pipeline = {
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
                                    }
                                ]
                            }
                        };
                        commandBuffer.bindPipeline(pipeline);
                        commandBuffer.bindDescriptorSet(BuiltinUniformBlocks.local.set + 1, pass.descriptorSet);
                        commandBuffer.draw();
                    }
                }
            }
            commandBuffer.endRenderPass();
        }
    }
};
//# sourceMappingURL=game.js.map