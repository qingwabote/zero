import { CommandBuffer, Format, FormatInfos, InputAssembler, Pipeline, VertexInputAttributeDescription } from "../../../core/gfx.js";
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

function stride2indexType(stride: number, gl: WebGL2RenderingContext): GLenum {
    switch (stride) {
        case 1: return gl.UNSIGNED_BYTE;
        case 2: return gl.UNSIGNED_SHORT;
        case 4: return gl.UNSIGNED_INT;
    }
    return -1;
}

const input2vao: Map<InputAssembler, WebGLVertexArrayObject> = new Map;


export default class WebCommandBuffer implements CommandBuffer {
    private _gl: WebGL2RenderingContext;
    private _inputAssembler: InputAssembler | null = null;

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
                    format2WebGLType(attribute.format, gl),
                    false,
                    buffer.info.stride,
                    calculateOffset(attribute, attributes));
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
        gl.drawElements(gl.TRIANGLES, buffer.info.size / buffer.info.stride, stride2indexType(buffer.info.stride, gl), buffer.info.offset);
    }

    endRenderPass() {

    }
}