import CommandBuffer from "../../../core/gfx/CommandBuffer.js";
import { Format, FormatInfos } from "../../../core/gfx.js";
import { InputAssembler, VertexInputAttributeDescription } from "../../../core/gfx/InputAssembler.js";
import Pipeline, { DescriptorSet, DescriptorType } from "../../../core/gfx/Pipeline.js";
import WebBuffer from "./WebBuffer.js";
import WebShader from "./WebShader.js";
import WebTexture from "./WebTexture.js";

// https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
function format2WebGLType(format: Format): GLenum {
    switch (format) {
        case Format.R8UI: return WebGL2RenderingContext.UNSIGNED_BYTE;
        case Format.R16UI: return WebGL2RenderingContext.UNSIGNED_SHORT;
        case Format.RG32F: return WebGL2RenderingContext.FLOAT;
        case Format.RGB32F: return WebGL2RenderingContext.FLOAT;
    }
}

// function calculateOffset(attribute: VertexInputAttributeDescription, attributes: VertexInputAttributeDescription[]): number {
//     let offset = 0;
//     for (const iterator of attributes) {
//         if (iterator.binding != attribute.binding) continue;
//         if (iterator.location >= attribute.location) continue;
//         offset += FormatInfos[iterator.format].size;
//     }
//     return offset;
// }

const input2vao: Map<InputAssembler, WebGLVertexArrayObject> = new Map;


export default class WebCommandBuffer implements CommandBuffer {
    private _gl: WebGL2RenderingContext;
    private _inputAssembler: InputAssembler | undefined;

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    beginRenderPass() {
        const gl = this._gl;

        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }

    bindPipeline(pipeline: Pipeline) {
        const gl = this._gl;

        gl.useProgram((pipeline.shader as WebShader).program);

        const dss = pipeline.depthStencilState;
        if (dss.depthTest) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
    }

    bindDescriptorSet(index: number, descriptorSet: DescriptorSet): void {
        const gl = this._gl;
        for (const layoutBinding of descriptorSet.layout.bindings) {
            if (layoutBinding.descriptorType == DescriptorType.UNIFORM_BUFFER) {
                const buffer = descriptorSet.buffers[layoutBinding.binding] as WebBuffer;
                gl.bindBufferBase(gl.UNIFORM_BUFFER, layoutBinding.binding + index * 10, buffer.buffer);
            } else if (layoutBinding.descriptorType == DescriptorType.SAMPLER_TEXTURE) {
                const texture = descriptorSet.textures[layoutBinding.binding] as WebTexture;
                gl.bindTexture(gl.TEXTURE_2D, texture.texture);
            }
        }
    }

    bindInputAssembler(inputAssembler: InputAssembler): void {
        const gl = this._gl;

        let vao = input2vao.get(inputAssembler);
        if (!vao) {
            vao = gl.createVertexArray()!;
            gl.bindVertexArray(vao);
            const attributes = inputAssembler.attributes;
            for (const attribute of attributes) {
                const buffer = inputAssembler.vertexBuffers[attribute.binding] as WebBuffer;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
                gl.enableVertexAttribArray(attribute.location);
                const formatInfo = FormatInfos[attribute.format];
                gl.vertexAttribPointer(
                    attribute.location,
                    formatInfo.count,
                    format2WebGLType(attribute.format),
                    false,
                    buffer.info.stride || formatInfo.size,
                    attribute.offset);
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (inputAssembler.indexBuffer as WebBuffer).buffer);
            input2vao.set(inputAssembler, vao);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        gl.bindVertexArray(vao);

        this._inputAssembler = inputAssembler;
    }

    draw() {
        if (!this._inputAssembler) return;

        const gl = this._gl;
        const buffer = this._inputAssembler.indexBuffer;
        const formatInfo = FormatInfos[this._inputAssembler.indexType];
        gl.drawElements(gl.TRIANGLES, buffer.info.size / formatInfo.size, format2WebGLType(this._inputAssembler.indexType), 0);
    }

    endRenderPass() {

    }
}