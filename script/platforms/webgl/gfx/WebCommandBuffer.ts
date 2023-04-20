import Buffer from "../../../main/core/gfx/Buffer.js";
import CommandBuffer from "../../../main/core/gfx/CommandBuffer.js";
import DescriptorSet from "../../../main/core/gfx/DescriptorSet.js";
import { DescriptorType } from "../../../main/core/gfx/DescriptorSetLayout.js";
import Format, { FormatInfos } from "../../../main/core/gfx/Format.js";
import { Framebuffer } from "../../../main/core/gfx/Framebuffer.js";
import InputAssembler, { IndexType, InputAssemblerInfo } from "../../../main/core/gfx/InputAssembler.js";
import Pipeline, { BlendFactor, CullMode, PipelineLayout } from "../../../main/core/gfx/Pipeline.js";
import RenderPass, { LOAD_OP } from "../../../main/core/gfx/RenderPass.js";
import Texture from "../../../main/core/gfx/Texture.js";
import { Rect } from "../../../main/core/math/rect.js";
import WebBuffer from "./WebBuffer.js";
import WebDescriptorSet from "./WebDescriptorSet.js";
import WebFramebuffer from "./WebFramebuffer.js";
import WebPipeline from "./WebPipeline.js";
import WebSampler from "./WebSampler.js";
import WebShader from "./WebShader.js";
import WebTexture from "./WebTexture.js";

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

// const WebGLBlendFactors: GLenum[] = [
//     0x0000, // WebGLRenderingContext.ZERO,
//     0x0001, // WebGLRenderingContext.ONE,
//     0x0302, // WebGLRenderingContext.SRC_ALPHA,
//     0x0304, // WebGLRenderingContext.DST_ALPHA,
//     0x0303, // WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
//     0x0305, // WebGLRenderingContext.ONE_MINUS_DST_ALPHA,
//     0x0300, // WebGLRenderingContext.SRC_COLOR,
//     0x0306, // WebGLRenderingContext.DST_COLOR,
//     0x0301, // WebGLRenderingContext.ONE_MINUS_SRC_COLOR,
//     0x0307, // WebGLRenderingContext.ONE_MINUS_DST_COLOR,
//     0x0308, // WebGLRenderingContext.SRC_ALPHA_SATURATE,
//     0x8001, // WebGLRenderingContext.CONSTANT_COLOR,
//     0x8002, // WebGLRenderingContext.ONE_MINUS_CONSTANT_COLOR,
//     0x8003, // WebGLRenderingContext.CONSTANT_ALPHA,
//     0x8004, // WebGLRenderingContext.ONE_MINUS_CONSTANT_ALPHA,
// ];

// function calculateOffset(attribute: VertexInputAttributeDescription, attributes: VertexInputAttributeDescription[]): number {
//     let offset = 0;
//     for (const iterator of attributes) {
//         if (iterator.binding != attribute.binding) continue;
//         if (iterator.location >= attribute.location) continue;
//         offset += FormatInfos[iterator.format].size;
//     }
//     return offset;
// }

const input2vao: WeakMap<InputAssemblerInfo, WebGLVertexArrayObject> = new WeakMap;


export default class WebCommandBuffer implements CommandBuffer {
    private _gl: WebGL2RenderingContext;
    private _inputAssembler: InputAssemblerInfo | undefined;
    private _framebuffer!: WebFramebuffer;
    private _viewport!: Rect;

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
        gl.bindTexture(gl.TEXTURE_2D, (texture as WebTexture).texture.deref());
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, imageBitmap.width, imageBitmap.height, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    beginRenderPass(renderPass: RenderPass, framebuffer: Framebuffer, viewport: Rect) {
        const gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, (framebuffer as WebFramebuffer).impl?.deref() || null);
        this._framebuffer = framebuffer as WebFramebuffer;

        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        gl.scissor(viewport.x, viewport.y, viewport.width, viewport.height);
        this._viewport = viewport;

        let flag: number = 0;
        for (const attachment of renderPass.info.colorAttachments) {
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
        const state = (pipeline as WebPipeline).info.passState;

        gl.useProgram((state.shader as WebShader).program.deref());

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
    }

    bindDescriptorSet(pipelineLayout: PipelineLayout, index: number, descriptorSet: DescriptorSet, dynamicOffsets?: number[]): void {
        const gl = this._gl;

        let dynamicIndex = 0;
        for (const layoutBinding of descriptorSet.layout.bindings) {
            if (layoutBinding.descriptorType == DescriptorType.UNIFORM_BUFFER) {
                const buffer = (descriptorSet as WebDescriptorSet).getBuffer(layoutBinding.binding) as WebBuffer;
                gl.bindBufferBase(gl.UNIFORM_BUFFER, layoutBinding.binding + index * 10, buffer.impl.deref());
            } else if (layoutBinding.descriptorType == DescriptorType.UNIFORM_BUFFER_DYNAMIC) {
                const offset = dynamicOffsets![dynamicIndex++];
                const buffer = (descriptorSet as WebDescriptorSet).getBuffer(layoutBinding.binding) as WebBuffer;
                const range = (descriptorSet as WebDescriptorSet).getBufferRange(layoutBinding.binding);
                gl.bindBufferRange(gl.UNIFORM_BUFFER, layoutBinding.binding + index * 10, buffer.impl.deref(), offset, range);
            } else if (layoutBinding.descriptorType == DescriptorType.SAMPLER_TEXTURE) {
                const texture = (descriptorSet as WebDescriptorSet).getTexture(layoutBinding.binding) as WebTexture;
                const unit = layoutBinding.binding + index * 10;
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, texture.texture.deref());

                const sampler = (descriptorSet as WebDescriptorSet).getSampler(layoutBinding.binding) as WebSampler;
                gl.bindSampler(unit, sampler.impl.deref());
            }
        }
    }

    bindInputAssembler(inputAssembler: InputAssembler): void {
        const gl = this._gl;

        const inputAssemblerInfo = inputAssembler.info;
        let vao = input2vao.get(inputAssemblerInfo);
        if (!vao) {
            vao = gl.createVertexArray()!;
            gl.bindVertexArray(vao);
            const attributes = inputAssemblerInfo.vertexInputState.attributes;
            for (const attribute of attributes) {
                const binding = inputAssemblerInfo.vertexInputState.bindings[attribute.binding];
                const buffer = inputAssemblerInfo.vertexInput.buffers[attribute.binding] as WebBuffer;
                const offset = inputAssemblerInfo.vertexInput.offsets[attribute.binding];
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.impl.deref());
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
                        formatInfo.count,
                        type,
                        binding.stride, offset + attribute.offset);
                } else {
                    gl.vertexAttribPointer(
                        attribute.location,
                        formatInfo.count,
                        type,
                        false,
                        binding.stride,
                        offset + attribute.offset);
                }

            }
            if (inputAssemblerInfo.indexInput) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (inputAssemblerInfo.indexInput.buffer as WebBuffer).impl.deref());
            }
            input2vao.set(inputAssemblerInfo, vao);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        gl.bindVertexArray(vao);

        this._inputAssembler = inputAssemblerInfo;
    }

    draw(vertexCount: number): void {
        const gl = this._gl;
        gl.drawArrays(gl.LINES, 0, vertexCount);
    }

    drawIndexed(indexCount: number) {
        const indexInput = this._inputAssembler!.indexInput!;

        let type: GLenum;
        switch (indexInput.type) {
            case IndexType.UINT16:
                type = WebGL2RenderingContext.UNSIGNED_SHORT;
                break;
            case IndexType.UINT32:
                type = WebGL2RenderingContext.UNSIGNED_INT;
                break;
            default:
                console.error('unsupported index type');
                return;
        }

        const gl = this._gl;
        gl.drawElements(gl.TRIANGLES, indexCount, type, indexInput.offset);
        gl.bindVertexArray(null);
    }

    endRenderPass() {
        const gl = this._gl;

        for (const attachment of this._framebuffer.info.resolveAttachments) {
            if (attachment == gfx.swapchain.colorTexture) {
                gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._framebuffer.impl?.deref() || null);
                gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

                gl.blitFramebuffer(
                    this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.y + this._viewport.height,
                    this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.y + this._viewport.height,
                    gl.COLOR_BUFFER_BIT, gl.LINEAR);
            }
        }
    }

    end(): void { }
}