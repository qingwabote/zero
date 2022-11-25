import Buffer from "../../../core/gfx/Buffer.js";
import CommandBuffer from "../../../core/gfx/CommandBuffer.js";
import { Framebuffer } from "../../../core/gfx/Framebuffer.js";
import Pipeline, { BlendFactor, CullMode, DescriptorSet, DescriptorType, Format, FormatInfos, IndexType, InputAssembler, PipelineLayout } from "../../../core/gfx/Pipeline.js";
import RenderPass, { LOAD_OP } from "../../../core/gfx/RenderPass.js";
import Texture from "../../../core/gfx/Texture.js";
import { Rect } from "../../../core/math/rect.js";
import WebBuffer from "./WebBuffer.js";
import WebDescriptorSet from "./WebDescriptorSet.js";
import WebDescriptorSetLayout from "./WebDescriptorSetLayout.js";
import WebFramebuffer from "./WebFramebuffer.js";
import WebPipeline from "./WebPipeline.js";
import WebShader from "./WebShader.js";
import WebTexture from "./WebTexture.js";

function bendFactor2WebGL(factor: BlendFactor): GLenum {
    switch (factor) {
        case BlendFactor.ZERO: return WebGL2RenderingContext.ZERO;
        case BlendFactor.ONE: return WebGL2RenderingContext.ONE;
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

const input2vao: WeakMap<InputAssembler, WebGLVertexArrayObject> = new WeakMap;


export default class WebCommandBuffer implements CommandBuffer {
    private _gl: WebGL2RenderingContext;
    private _inputAssembler: InputAssembler | undefined;
    private _framebuffer!: WebFramebuffer;
    private _viewport!: Rect;

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(): boolean { return false; }

    begin(): void { }

    copyBuffer(srcBuffer: ArrayBufferView, dstBuffer: Buffer): void {
        dstBuffer.update(srcBuffer);
    }

    copyImageBitmapToTexture(imageBitmap: ImageBitmap, texture: Texture): void {
        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, (texture as WebTexture).texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, imageBitmap.width, imageBitmap.height, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    beginRenderPass(renderPass: RenderPass, framebuffer: Framebuffer, viewport: Rect) {
        const gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, (framebuffer as WebFramebuffer).framebuffer);
        this._framebuffer = framebuffer as WebFramebuffer;

        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        gl.scissor(viewport.x, viewport.y, viewport.width, viewport.height);
        this._viewport = viewport;

        gl.clearColor(0, 0, 0, 1);
        let flag: number = 0;
        for (const attachment of renderPass.info.colorAttachments) {
            if (attachment.loadOp == LOAD_OP.CLEAR) {
                flag |= gl.COLOR_BUFFER_BIT;
            }
        }
        if (renderPass.info.depthStencilAttachment.loadOp == LOAD_OP.CLEAR) {
            flag |= gl.DEPTH_BUFFER_BIT;
        }
        gl.clear(flag)
    }

    bindPipeline(pipeline: Pipeline) {
        const gl = this._gl;
        const info = (pipeline as WebPipeline).info!;

        gl.useProgram((info.shader as WebShader).program);

        switch (info.rasterizationState.cullMode) {
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
                throw new Error(`unsupported cullMode: ${info.rasterizationState.cullMode}`);
        }

        gl.enable(gl.SCISSOR_TEST);

        gl.enable(gl.DEPTH_TEST);

        // const blend = info.blendState.blends[0];
        // if (blend.blend) {
        //     gl.enable(gl.BLEND);
        // } else {
        //     gl.disable(gl.BLEND);
        // }

        // gl.blendFuncSeparate(
        //     bendFactor2WebGL(blend.srcRGB),
        //     bendFactor2WebGL(blend.dstRGB),
        //     bendFactor2WebGL(blend.srcAlpha),
        //     bendFactor2WebGL(blend.dstAlpha),
        // );
    }

    bindDescriptorSet(pipelineLayout: PipelineLayout, index: number, descriptorSet: DescriptorSet, dynamicOffsets?: number[]): void {
        const gl = this._gl;

        let dynamicIndex = 0;
        for (const layoutBinding of ((descriptorSet as WebDescriptorSet).layout as WebDescriptorSetLayout).bindings) {
            if (layoutBinding.descriptorType == DescriptorType.UNIFORM_BUFFER) {
                const buffer = (descriptorSet as WebDescriptorSet).getBuffer(layoutBinding.binding) as WebBuffer;
                gl.bindBufferBase(gl.UNIFORM_BUFFER, layoutBinding.binding + index * 10, buffer.buffer);
            } else if (layoutBinding.descriptorType == DescriptorType.UNIFORM_BUFFER_DYNAMIC) {
                const offset = dynamicOffsets![dynamicIndex++];
                const buffer = (descriptorSet as WebDescriptorSet).getBuffer(layoutBinding.binding) as WebBuffer;
                const range = (descriptorSet as WebDescriptorSet).getBufferRange(layoutBinding.binding);
                gl.bindBufferRange(gl.UNIFORM_BUFFER, layoutBinding.binding + index * 10, buffer.buffer, offset, range);
            } else if (layoutBinding.descriptorType == DescriptorType.SAMPLER_TEXTURE) {
                const texture = (descriptorSet as WebDescriptorSet).getTexture(layoutBinding.binding) as WebTexture;
                gl.activeTexture(gl.TEXTURE0 + layoutBinding.binding + index * 10);
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
            const attributes = inputAssembler.vertexInputState.attributes;
            for (const attribute of attributes) {
                const binding = inputAssembler.vertexInputState.bindings[attribute.binding];
                const buffer = inputAssembler.vertexInput.vertexBuffers[attribute.binding] as WebBuffer;
                const offset = inputAssembler.vertexInput.vertexOffsets[attribute.binding];
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
                gl.enableVertexAttribArray(attribute.location);
                const formatInfo = FormatInfos[attribute.format];
                let type: GLenum
                switch (attribute.format) {
                    case Format.RG32F:
                    case Format.RGB32F:
                    case Format.RGBA32F:
                        type = WebGL2RenderingContext.FLOAT;
                        break;
                    default:
                        console.error('unsupported vertex type');
                        return;
                }
                gl.vertexAttribPointer(
                    attribute.location,
                    formatInfo.count,
                    type,
                    false,
                    binding.stride,
                    offset + attribute.offset);
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (inputAssembler.vertexInput.indexBuffer as WebBuffer).buffer);
            input2vao.set(inputAssembler, vao);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        gl.bindVertexArray(vao);

        this._inputAssembler = inputAssembler;
    }

    draw() {
        if (!this._inputAssembler) {
            return
        };

        let type: GLenum;
        switch (this._inputAssembler.vertexInput.indexType) {
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
        gl.drawElements(gl.TRIANGLES, this._inputAssembler.vertexInput.indexCount, type, this._inputAssembler.vertexInput.indexOffset);
        gl.bindVertexArray(null);
    }

    endRenderPass() {
        const gl = this._gl;

        for (const attachment of this._framebuffer.info.resolveAttachments) {
            if (attachment == gfx.swapchain.colorTexture) {
                gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._framebuffer.framebuffer);
                gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

                gl.blitFramebuffer(
                    this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height,
                    this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height,
                    gl.COLOR_BUFFER_BIT, gl.LINEAR);
            }
        }
    }

    end(): void { }
}