import Buffer from "./Buffer.js";
import Camera from "./Camera.js";
import { ComponentInvoker } from "./ComponentInvoker.js";
import gfx from "./gfx.js";
import Node from "./Node.js";
import Pipeline, { DescriptorSet, blocksGlobal, globalDescriptorSetLayout, blocksLocal } from "./Pipeline.js";
import RenderScene from "./RenderScene.js";

let _width: number;
let _height: number;

let _componentStartInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.start() }, true)
let _componentUpdateInvoker: ComponentInvoker = new ComponentInvoker(function (com, dt) { com.update(dt) }, false)

let _scene: Node;

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
        _width = width;
        _height = height;

        _scene = new Node();

        _renderScene = new RenderScene;

        _camera = new Camera(10);

        const buffers: Buffer[] = [];
        buffers[blocksGlobal.blocks.Camera.binding] = _camera.ubo;
        _globalDescriptorSet = { layout: globalDescriptorSetLayout, buffers };
    },

    tick(dt: number) {
        // _scene.update(dt);

        _componentStartInvoker.invoke(dt);
        _componentUpdateInvoker.invoke(dt);

        _renderScene.update(dt);

        _camera.update();

        const commandBuffer = gfx.device.commandBuffer;
        commandBuffer.beginRenderPass()
        commandBuffer.bindDescriptorSet(blocksGlobal.set, _globalDescriptorSet);

        for (const model of _renderScene.models) {
            commandBuffer.bindDescriptorSet(blocksLocal.set, model.descriptorSet);
            for (const subModel of model.subModels) {
                for (const pass of subModel.passes) {
                    const pipeline: Pipeline = { shader: pass.shader };
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindInputAssembler(subModel.inputAssembler);
                    commandBuffer.draw();
                }
            }
        }

        commandBuffer.endRenderPass()
    }
}