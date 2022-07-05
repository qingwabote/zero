import Buffer from "./Buffer.js";
import Camera from "./Camera.js";
import gfx from "./gfx.js";
import Pipeline, { DescriptorSet, globalDescriptorSetLayout, PipelineGlobalBindings } from "./Pipeline.js";
import RenderScene from "./RenderScene.js";

let _width: number;
let _height: number;

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

    get renderScene(): RenderScene {
        return _renderScene;
    },

    init(width: number, height: number) {
        _width = width;
        _height = height;

        _renderScene = new RenderScene;

        _camera = new Camera(10);

        const buffers: Buffer[] = [];
        buffers[PipelineGlobalBindings.UBO_CAMERA] = _camera.ubo;
        _globalDescriptorSet = { layout: globalDescriptorSetLayout, buffers }
    },

    tick(dt: number) {
        _renderScene.tick(dt);

        _camera.update();

        const commandBuffer = gfx.device.commandBuffer;
        commandBuffer.beginRenderPass()

        for (const model of _renderScene.models) {
            for (const subModel of model.subModels) {
                for (const pass of subModel.passes) {
                    const pipeline: Pipeline = { shader: pass.shader };
                    commandBuffer.bindPipeline(pipeline)
                    commandBuffer.bindDescriptorSet(0, _globalDescriptorSet);
                    commandBuffer.bindInputAssembler(subModel.inputAssembler)
                    commandBuffer.draw()
                }
            }
        }

        commandBuffer.endRenderPass()
    }
}