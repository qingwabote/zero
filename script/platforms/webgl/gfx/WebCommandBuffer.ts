import { Buffer, CommandBuffer, Format, FormatInfos, Pipeline, VertexInputAttributeDescription } from "../../../core/gfx.js";
import WebBuffer from "./WebBuffer.js";
import WebShader from "./WebShader.js";

function format2WebGLType(format: Format, gl: WebGL2RenderingContext): GLenum {
    switch (format) {
        case Format.RG32F: return gl.FLOAT;
    }
}

function calculateOffset(attribute: VertexInputAttributeDescription, attributes: VertexInputAttributeDescription[]): number {
    let offset = 0;
    for (const iterator of attributes) {
        if (iterator.binding != attribute.binding) continue;
        if (iterator.location >= attribute.location) continue;
        offset += FormatInfos[iterator.format].size;
    }
    return offset;
}


export default class WebCommandBuffer implements CommandBuffer {
    private _gl: WebGL2RenderingContext;

    private _pipeline: Pipeline | null = null;

    private _buffers: Buffer[] = [];
    private _bufferBindings: number[] = [];

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    beginRenderPass() {
        this._gl.clearColor(0, 0, 0, 1)
        this._gl.clear(this._gl.COLOR_BUFFER_BIT)
    }

    bindPipeline(pipeline: Pipeline) {
        const gl = this._gl;
        gl.useProgram((pipeline.shader as WebShader).program)
        this._pipeline = pipeline;
    }

    bindVertexBuffers(buffers: Buffer[], bufferBindings: number[]) {
        this._buffers = buffers;
        this._bufferBindings = bufferBindings;
    }

    bindIndexBuffer() {

    }

    draw() {
        this.bindAttrAndBuffer();

        const gl = this._gl;
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    endRenderPass() {

    }

    /**
     * WebGL has no function like glBindVertexBuffer to "separately specify the format of a vertex attribute from the source buffer",
     * so we do them here.
     * https://www.khronos.org/opengl/wiki/Vertex_Specification#Separate_attribute_format
     */
    private bindAttrAndBuffer() {
        if (!this._pipeline) return;

        const gl = this._gl;
        const vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);
        const attributes = this._pipeline.vertexInput.vertexAttributeDescriptions;
        for (const attribute of attributes) {
            const index = this._bufferBindings.indexOf(attribute.binding);
            if (index == -1) return;
            const buffer = this._buffers[index] as WebBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.enableVertexAttribArray(attribute.location);
            const formatInfo = FormatInfos[attribute.format];
            gl.vertexAttribPointer(
                attribute.location,
                formatInfo.count,
                format2WebGLType(attribute.format, gl),
                false,
                formatInfo.size,
                calculateOffset(attribute, attributes));
        }
    }
}