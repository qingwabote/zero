import { AttachmentDescription, BlendFactor, Buffer, CommandBuffer, CullMode, DescriptorSet, DescriptorSetLayoutBinding, DescriptorType, Format, FormatInfos, Framebuffer, IndexType, InputAssembler, InputAssemblerInfo, LOAD_OP, Pipeline, PipelineInfo, PipelineLayout, PrimitiveTopology, RenderPass, Shader, Texture, Uint32Vector, VertexInputAttributeDescription } from "gfx-main";
import WebBuffer from "./WebBuffer.js";
import WebDescriptorSet from "./WebDescriptorSet.js";
import WebFramebuffer from "./WebFramebuffer.js";
import WebPipeline from "./WebPipeline.js";
import WebSampler from "./WebSampler.js";
import WebShader from "./WebShader.js";
import WebTexture from "./WebTexture.js";
import { Vector } from "./info.js";

function bendFactor2WebGL(factor: BlendFactor): GLenum {
    switch (factor) {
        case BlendFactor.ZERO: return WebGL2RenderingContext.ZERO;
        case BlendFactor.ONE: return WebGL2RenderingContext.ONE;
        case BlendFactor.SRC_ALPHA: return WebGL2RenderingContext.SRC_ALPHA;
        case BlendFactor.DST_ALPHA: return WebGL2RenderingContext.DST_ALPHA;
        case BlendFactor.ONE_MINUS_SRC_ALPHA: return WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA;
        case BlendFactor.ONE_MINUS_DST_ALPHA: return WebGL2RenderingContext.ONE_MINUS_DST_ALPHA;
    }
}

const input2vao: WeakMap<InputAssemblerInfo, WeakMap<Shader, WebGLVertexArrayObject>> = new WeakMap;

export default class WebCommandBuffer implements CommandBuffer {
    private _gl: WebGL2RenderingContext;

    private _pipeline!: PipelineInfo;
    private _pipeline_invalid = false;

    private _inputAssembler!: InputAssemblerInfo;
    private _inputAssembler_invalid = false;

    private _framebuffer!: WebFramebuffer;
    private _viewport!: { x: number, y: number, width: number, height: number };

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(): boolean { return false; }

    begin(): void { }

    copyBuffer(srcBuffer: ArrayBuffer, dstBuffer: Buffer, srcOffset: number, length: number): void {
        dstBuffer.update(srcBuffer, srcOffset, length);
    }

    copyImageBitmapToTexture(imageBitmap: ImageBitmap, texture: Texture): void {
        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, (texture as WebTexture).texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, imageBitmap.width, imageBitmap.height, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    beginRenderPass(renderPass: RenderPass, framebuffer: Framebuffer, x: number, y: number, width: number, height: number) {
        const gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, (framebuffer as WebFramebuffer).impl);
        this._framebuffer = framebuffer as WebFramebuffer;

        gl.viewport(x, y, width, height);
        gl.scissor(x, y, width, height);
        this._viewport = { x, y, width, height };

        let flag: number = 0;
        for (const attachment of (renderPass.info.colorAttachments as Vector<AttachmentDescription>).data) {
            if (attachment.loadOp == LOAD_OP.CLEAR) {
                gl.clearColor(0, 0, 0, 1);
                flag |= gl.COLOR_BUFFER_BIT;
            }
        }
        if (renderPass.info.depthStencilAttachment.loadOp == LOAD_OP.CLEAR) {
            flag |= gl.DEPTH_BUFFER_BIT;
        }
        if (flag) {
            gl.clear(flag);
        }
    }

    bindPipeline(pipeline: Pipeline) {
        const gl = this._gl;
        const info = (pipeline as WebPipeline).info;
        const state = info.passState;

        gl.useProgram((state.shader as WebShader).program);

        switch (state.rasterizationState.cullMode) {
            case CullMode.NONE:
                gl.disable(gl.CULL_FACE);
                break;
            case CullMode.FRONT:
                gl.cullFace(gl.FRONT);
                gl.enable(gl.CULL_FACE);
                break;
            case CullMode.BACK:
                gl.cullFace(gl.BACK);
                gl.enable(gl.CULL_FACE);
                break;
            default:
                throw new Error(`unsupported cullMode: ${state.rasterizationState.cullMode}`);
        }

        gl.enable(gl.SCISSOR_TEST);

        if (state.depthStencilState?.depthTestEnable) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }

        const blendState = state.blendState;
        if (blendState) {
            gl.blendFuncSeparate(
                bendFactor2WebGL(blendState.srcRGB),
                bendFactor2WebGL(blendState.dstRGB),
                bendFactor2WebGL(blendState.srcAlpha),
                bendFactor2WebGL(blendState.dstAlpha),
            );
            gl.enable(gl.BLEND);
        } else {
            gl.disable(gl.BLEND);
        }

        this._pipeline = info;
        this._pipeline_invalid = true;
    }

    bindDescriptorSet(pipelineLayout: PipelineLayout, index: number, descriptorSet: DescriptorSet, dynamicOffsets?: Uint32Vector): void {
        const gl = this._gl;

        let dynamicIndex = 0;
        for (const layoutBinding of (descriptorSet.layout.info.bindings as Vector<DescriptorSetLayoutBinding>).data) {
            if (layoutBinding.descriptorType == DescriptorType.UNIFORM_BUFFER) {
                const buffer = (descriptorSet as WebDescriptorSet).getBuffer(layoutBinding.binding) as WebBuffer;
                gl.bindBufferBase(gl.UNIFORM_BUFFER, layoutBinding.binding + index * 10, buffer.impl);
            } else if (layoutBinding.descriptorType == DescriptorType.UNIFORM_BUFFER_DYNAMIC) {
                const offset = (dynamicOffsets! as Vector<number>).data[dynamicIndex++];
                const buffer = (descriptorSet as WebDescriptorSet).getBuffer(layoutBinding.binding) as WebBuffer;
                const range = (descriptorSet as WebDescriptorSet).getBufferRange(layoutBinding.binding);
                gl.bindBufferRange(gl.UNIFORM_BUFFER, layoutBinding.binding + index * 10, buffer.impl, offset, range);
            } else if (layoutBinding.descriptorType == DescriptorType.SAMPLER_TEXTURE) {
                const texture = (descriptorSet as WebDescriptorSet).getTexture(layoutBinding.binding) as WebTexture;
                const unit = layoutBinding.binding + index * 10;
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, texture.texture);

                const sampler = (descriptorSet as WebDescriptorSet).getSampler(layoutBinding.binding) as WebSampler;
                gl.bindSampler(unit, sampler.impl);
            }
        }
    }

    bindInputAssembler(inputAssembler: InputAssembler): void {
        this._inputAssembler = inputAssembler.info;
        this._inputAssembler_invalid = true;
    }

    draw(vertexCount: number): void {
        this.bindVertexArray();

        const gl = this._gl;

        let mode: GLenum;
        switch (this._pipeline.passState.primitive) {
            case PrimitiveTopology.LINE_LIST:
                mode = gl.LINES;
                break;
            case PrimitiveTopology.TRIANGLE_LIST:
                mode = gl.TRIANGLES;
                break;
            default:
                throw `unsupported primitive: ${this._pipeline.passState.primitive}`
        }
        gl.drawArrays(mode, 0, vertexCount);
        gl.bindVertexArray(null);
    }

    drawIndexed(indexCount: number, firstIndex: number) {
        this.bindVertexArray();

        const indexInput = this._inputAssembler!.indexInput!;

        let type: GLenum;
        let type_bytes: number;
        switch (indexInput.type) {
            case IndexType.UINT16:
                type = WebGL2RenderingContext.UNSIGNED_SHORT;
                type_bytes = 2;
                break;
            case IndexType.UINT32:
                type = WebGL2RenderingContext.UNSIGNED_INT;
                type_bytes = 4;
                break;
            default:
                console.error('unsupported index type');
                return;
        }

        const gl = this._gl;
        gl.drawElements(gl.TRIANGLES, indexCount, type, (indexInput.buffer.info.stride || type_bytes) * firstIndex);
        gl.bindVertexArray(null);
    }

    endRenderPass() {
        const gl = this._gl;

        for (const attachment of (this._framebuffer.info.resolveAttachments as Vector<Texture>).data) {
            if ((attachment as WebTexture).swapchain) {
                gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._framebuffer.impl);
                gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

                gl.blitFramebuffer(
                    this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.y + this._viewport.height,
                    this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.y + this._viewport.height,
                    gl.COLOR_BUFFER_BIT, gl.LINEAR);
            }
        }
    }

    end(): void { }

    private bindVertexArray() {
        const gl = this._gl;

        const inputAssembler = this._inputAssembler
        const shader = this._pipeline.passState.shader;
        const vertexInputState = this._pipeline.vertexInputState;

        let vao = input2vao.get(inputAssembler)?.get(shader);
        if (!vao) {
            vao = gl.createVertexArray()!;
            gl.bindVertexArray(vao);
            const attributes = (vertexInputState.attributes as Vector<VertexInputAttributeDescription>).data;
            for (const attribute of attributes) {
                const binding = vertexInputState.bindings.get(attribute.binding);
                const buffer = (inputAssembler.vertexInput.buffers as Vector<Buffer>).data[attribute.binding] as WebBuffer;
                const offset = (inputAssembler.vertexInput.offsets as Vector<number>).data[attribute.binding];
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.impl);
                gl.enableVertexAttribArray(attribute.location);
                const formatInfo = FormatInfos[attribute.format];
                let type: GLenum;
                let isInteger: boolean;
                switch (attribute.format) {
                    case Format.RG32_SFLOAT:
                    case Format.RGB32_SFLOAT:
                    case Format.RGBA32_SFLOAT:
                        type = WebGL2RenderingContext.FLOAT;
                        isInteger = false;
                        break;
                    case Format.RGBA8_UINT:
                        type = WebGL2RenderingContext.UNSIGNED_BYTE;
                        isInteger = true;
                        break;
                    case Format.RGBA16_UINT:
                        type = WebGL2RenderingContext.UNSIGNED_SHORT;
                        isInteger = true;
                        break;
                    case Format.RGBA32_UINT:
                        type = WebGL2RenderingContext.UNSIGNED_INT;
                        isInteger = true;
                        break;
                    default:
                        console.error('unsupported vertex type');
                        return;
                }
                if (isInteger) {
                    gl.vertexAttribIPointer(
                        attribute.location,
                        formatInfo.nums,
                        type,
                        binding.stride, offset + attribute.offset);
                } else {
                    gl.vertexAttribPointer(
                        attribute.location,
                        formatInfo.nums,
                        type,
                        false,
                        binding.stride,
                        offset + attribute.offset);
                }

            }
            if (inputAssembler.indexInput) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (inputAssembler.indexInput.buffer as WebBuffer).impl);
            }

            let map = input2vao.get(inputAssembler);
            if (!map) {
                map = new Map;
                input2vao.set(inputAssembler, map);
            }
            map.set(shader, vao);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        gl.bindVertexArray(vao);
    }
}