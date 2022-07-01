import gfx, { BufferUsageBit, Format, InputAssembler, Pipeline, ShaderStageBit, VertexInputAttributeDescription } from "./gfx.js";
import Model from "./Model.js";
import RenderScene from "./RenderScene.js";

let _renderScene: RenderScene;

export default {
    get renderScene(): RenderScene {
        return _renderScene;
    },

    init() {
        _renderScene = new RenderScene;

        // const vertices = new Float32Array([
        //     0, 0,
        //     0, 0.5,
        //     0.7, 0,
        // ]);
        // const vertexBuffer = gfx.device.createBuffer({ usage: BufferUsageBit.VERTEX, stride: 8, size: vertices.buffer.byteLength, offset: 0 });
        // vertexBuffer.update(vertices)

        // const indices = new Uint16Array([0, 1, 2]);
        // const intexBuffer = gfx.device.createBuffer({ usage: BufferUsageBit.INDEX, stride: 2, size: indices.buffer.byteLength, offset: 0 });
        // intexBuffer.update(indices);
    },

    tick(dt: number) {
        _renderScene.tick(dt);

        const commandBuffer = gfx.commandBuffer;
        commandBuffer.beginRenderPass()

        for (const model of _renderScene.models) {
            for (const subModel of model.subModels) {
                for (const pass of subModel.passes) {
                    const pipeline: Pipeline = { shader: pass.shader };
                    commandBuffer.bindPipeline(pipeline)
                    commandBuffer.bindInputAssembler(subModel.inputAssembler)
                    commandBuffer.draw()
                }
            }
        }

        commandBuffer.endRenderPass()
    }
}