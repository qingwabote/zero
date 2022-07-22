import { ComponentInvoker } from "./ComponentInvoker.js";
import gfx from "./gfx.js";
import Buffer from "./gfx/Buffer.js";
import Pipeline, { BlendFactor, BuiltinDescriptorSetLayouts, BuiltinUniformBlocks, DescriptorSet } from "./gfx/Pipeline.js";
import Camera from "./render/Camera.js";
import RenderScene from "./render/RenderScene.js";

let _width: number;
let _height: number;

let _componentStartInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.start() }, true)
let _componentUpdateInvoker: ComponentInvoker = new ComponentInvoker(function (com, dt) { com.update(dt) }, false)

let _renderScene: RenderScene;

let _globalDescriptorSet: DescriptorSet;

let _camera: Camera;

export default {
    get width(): number {
        return _width;
    },

    get height(): number {
        return _height;
    },

    get componentStartInvoker(): ComponentInvoker {
        return _componentStartInvoker;
    },

    get componentUpdateInvoker(): ComponentInvoker {
        return _componentUpdateInvoker;
    },

    get renderScene(): RenderScene {
        return _renderScene;
    },

    init(width: number, height: number) {
        _renderScene = new RenderScene;

        _camera = new Camera(width, height);
        _camera.fov = 45;

        _width = width;
        _height = height;

        const buffers: Buffer[] = [];
        buffers[BuiltinUniformBlocks.global.blocks.Camera.binding] = _camera.ubo;
        _globalDescriptorSet = { layout: BuiltinDescriptorSetLayouts.global, buffers, textures: [] };
    },

    tick(dt: number) {
        _componentStartInvoker.invoke(dt);
        _componentUpdateInvoker.invoke(dt);

        _renderScene.update(dt);

        _camera.update();

        const commandBuffer = gfx.device.commandBuffer;
        commandBuffer.beginRenderPass()
        commandBuffer.bindDescriptorSet(BuiltinUniformBlocks.global.set, _globalDescriptorSet);

        for (const model of _renderScene.models) {
            commandBuffer.bindDescriptorSet(BuiltinUniformBlocks.local.set, model.descriptorSet);
            for (const subModel of model.subModels) {
                commandBuffer.bindInputAssembler(subModel.inputAssembler);
                for (const pass of subModel.passes) {
                    const pipeline: Pipeline = {
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
                    };
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindDescriptorSet(BuiltinUniformBlocks.local.set + 1, pass.descriptorSet);
                    commandBuffer.draw();
                }
            }
        }

        commandBuffer.endRenderPass()
    }
}