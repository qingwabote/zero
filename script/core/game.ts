import gfx, { BufferUsageBit, Format, InputAssembler, Pipeline, ShaderStageBit, VertexInputAttributeDescription } from "./gfx.js";

const vs = `#version 300 es
    
in vec4 a_position;

void main() {
    gl_Position = a_position;
}
`

const fs = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

out vec4 v_color;

void main() {
    // Just set the output to a constant redish-purple
    v_color = vec4(1, 0, 0.5, 1);
}
`

export default {
    init() {
        const shader = gfx.device.createShader({
            name: "zero",
            stages: [
                { type: ShaderStageBit.VERTEX, source: vs },
                { type: ShaderStageBit.FRAGMENT, source: fs },
            ]
        });

        const vertices = new Float32Array([
            0, 0,
            0, 0.5,
            0.7, 0,
        ]);
        const vertexBuffer = gfx.device.createBuffer({ usage: BufferUsageBit.VERTEX, stride: 8, size: vertices.buffer.byteLength, offset: 0 });
        vertexBuffer.update(vertices.buffer)

        const indices = new Uint16Array([0, 1, 2]);
        const intexBuffer = gfx.device.createBuffer({ usage: BufferUsageBit.INDEX, stride: 2, size: indices.buffer.byteLength, offset: 0 });
        intexBuffer.update(indices.buffer);

        const attribute: VertexInputAttributeDescription = {
            location: 0,
            binding: 0,
            format: Format.RG32F,
        }
        const pipeline: Pipeline = { shader };
        const inputAssembler: InputAssembler = { attributes: [attribute], vertexBuffers: [vertexBuffer], indexBuffer: intexBuffer }

        const commandBuffer = gfx.commandBuffer;
        commandBuffer.beginRenderPass()
        commandBuffer.bindPipeline(pipeline)
        commandBuffer.bindInputAssembler(inputAssembler)
        commandBuffer.draw()
        commandBuffer.endRenderPass()
    },

    tick(dt: number) {
        // console.log("tick", dt)
    }
}