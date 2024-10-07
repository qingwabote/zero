import { BlendFactor, CullMode, DescriptorType, Format, FormatInfos, IndexType, LOAD_OP, PrimitiveTopology } from "gfx-common";
import { Buffer } from "./Buffer.js";
import { DescriptorSet } from "./DescriptorSet.js";
import { Framebuffer } from "./Framebuffer.js";
import { Pipeline } from "./Pipeline.js";
import { RenderPass } from "./RenderPass.js";
import { Texture } from "./Texture.js";
import { AttachmentDescription, InputAssembler, Uint32Vector, Vector, VertexAttribute } from "./info.js";
import { Formats } from "./internal/mapping.js";

function bendFactor2WebGL(gl: WebGL2RenderingContext, factor: BlendFactor): GLenum {
    switch (factor) {
        case BlendFactor.ZERO: return gl.ZERO;
        case BlendFactor.ONE: return gl.ONE;
        case BlendFactor.SRC_ALPHA: return gl.SRC_ALPHA;
        case BlendFactor.DST_ALPHA: return gl.DST_ALPHA;
        case BlendFactor.ONE_MINUS_SRC_ALPHA: return gl.ONE_MINUS_SRC_ALPHA;
        case BlendFactor.ONE_MINUS_DST_ALPHA: return gl.ONE_MINUS_DST_ALPHA;
    }
}

const input2vao: WeakMap<InputAssembler, WebGLVertexArrayObject> = new WeakMap;

export class CommandBuffer {
    private _inputAssembler!: InputAssembler;

    private _pipeline!: Pipeline;

    private _framebuffer!: Framebuffer;
    private _viewport!: { x: number, y: number, width: number, height: number };

    private _descriptorSets: Map<number, DescriptorSet> = new Map;
    private _dynamicOffsets: Map<number, Uint32Vector> = new Map;

    constructor(private _gl: WebGL2RenderingContext) { }

    begin(): void { }

    copyImageBitmapToTexture(imageBitmap: ImageBitmap, texture: Texture): void {
        const gl = this._gl;
        const format = Formats[texture.info.format];
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, imageBitmap.width, imageBitmap.height, format.format, format.type, imageBitmap);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    copyBufferToTexture(buffer: ArrayBufferView, texture: Texture, offset_x: number, offset_y: number, extent_x: number, extent_y: number): void {
        const gl = this._gl;
        const format = Formats[texture.info.format];
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, offset_x, offset_y, extent_x, extent_y, format.format, format.type, buffer);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    beginRenderPass(renderPass: RenderPass, framebuffer: Framebuffer, x: number, y: number, width: number, height: number) {
        const gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.impl);
        this._framebuffer = framebuffer;

        gl.viewport(x, y, width, height);
        gl.scissor(x, y, width, height);
        this._viewport = { x, y, width, height };

        let flag: number = 0;
        for (const attachment of (renderPass.info.colors as Vector<AttachmentDescription>).data) {
            if (attachment.loadOp == LOAD_OP.CLEAR) {
                gl.clearColor(0, 0, 0, 1);
                flag |= gl.COLOR_BUFFER_BIT;
            }
        }
        if (renderPass.info.depthStencil.loadOp == LOAD_OP.CLEAR) {
            flag |= gl.DEPTH_BUFFER_BIT;
        }
        if (flag) {
            gl.clear(flag);
        }
    }

    bindPipeline(pipeline: Pipeline) {
        const gl = this._gl;
        const info = pipeline.info;

        info.shader!.setLayout(info.layout!);

        gl.useProgram(info.shader!.impl);

        switch (info.rasterizationState!.cullMode) {
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
                throw new Error(`unsupported cullMode: ${info.rasterizationState!.cullMode}`);
        }

        gl.enable(gl.SCISSOR_TEST);

        if (info.depthStencilState?.depthTestEnable) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }

        const blendState = info.blendState;
        if (blendState) {
            gl.blendFuncSeparate(
                bendFactor2WebGL(gl, blendState.srcRGB),
                bendFactor2WebGL(gl, blendState.dstRGB),
                bendFactor2WebGL(gl, blendState.srcAlpha),
                bendFactor2WebGL(gl, blendState.dstAlpha),
            );
            gl.enable(gl.BLEND);
        } else {
            gl.disable(gl.BLEND);
        }

        this._pipeline = pipeline;
    }

    bindDescriptorSet(index: number, descriptorSet: DescriptorSet, dynamicOffsets?: Uint32Vector): void {
        this._descriptorSets.set(index, descriptorSet);
        if (dynamicOffsets) {
            this._dynamicOffsets.set(index, dynamicOffsets);
        }
    }

    bindInputAssembler(inputAssembler: InputAssembler): void {
        const gl = this._gl;

        let vao = input2vao.get(inputAssembler);
        if (!vao) {
            vao = gl.createVertexArray()!;
            gl.bindVertexArray(vao);
            const attributes = (inputAssembler.vertexInputState.attributes as Vector<VertexAttribute>).data;
            for (const attribute of attributes) {
                const buffer = (inputAssembler.vertexInput.buffers as Vector<Buffer>).data[attribute.buffer];
                const bufferOffset = (inputAssembler.vertexInput.offsets as Vector<number>).data[attribute.buffer];
                const stride = attribute.stride || attributes.reduce((acc, attr) => acc + (attr.buffer == attribute.buffer ? FormatInfos[attr.format].bytes * attr.multiple : 0), 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.impl);
                for (let i = 0; i < attribute.multiple; i++) {
                    const formatInfo = FormatInfos[attribute.format];

                    const location = attribute.location + i;
                    const offset = attribute.offset + (formatInfo.bytes * i)
                    gl.enableVertexAttribArray(location);
                    let type: GLenum;
                    let isInteger: boolean;
                    switch (attribute.format) {
                        case Format.RG32_SFLOAT:
                        case Format.RGB32_SFLOAT:
                        case Format.RGBA32_SFLOAT:
                            type = gl.FLOAT;
                            isInteger = false;
                            break;
                        case Format.RGBA8_UINT:
                            type = gl.UNSIGNED_BYTE;
                            isInteger = true;
                            break;
                        case Format.RGBA16_UINT:
                            type = gl.UNSIGNED_SHORT;
                            isInteger = true;
                            break;
                        case Format.RGBA32_UINT:
                            type = gl.UNSIGNED_INT;
                            isInteger = true;
                            break;
                        default:
                            throw 'unsupported vertex type';
                    }
                    if (isInteger) {
                        gl.vertexAttribIPointer(
                            location,
                            formatInfo.nums,
                            type,
                            stride, bufferOffset + offset);
                    } else {
                        gl.vertexAttribPointer(
                            location,
                            formatInfo.nums,
                            type,
                            false,
                            stride,
                            bufferOffset + offset);
                    }
                    if (attribute.instanced) {
                        gl.vertexAttribDivisor(location, 1);
                    }
                }
            }
            if (inputAssembler.indexInput) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, inputAssembler.indexInput.buffer!.impl);
            }

            input2vao.set(inputAssembler, vao);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        gl.bindVertexArray(vao);

        this._inputAssembler = inputAssembler;
    }

    draw(vertexCount: number, firstVertex: number, instanceCount: number): void {
        this.bindDescriptorSets();

        const gl = this._gl;

        let mode: GLenum;
        switch (this._inputAssembler.vertexInputState.primitive) {
            case PrimitiveTopology.LINE_LIST:
                mode = gl.LINES;
                break;
            case PrimitiveTopology.TRIANGLE_LIST:
                mode = gl.TRIANGLES;
                break;
            default:
                throw `unsupported primitive: ${this._inputAssembler.vertexInputState.primitive}`
        }

        gl.drawArraysInstanced(mode, firstVertex, vertexCount, instanceCount);
        gl.bindVertexArray(null);
    }

    drawIndexed(indexCount: number, firstIndex: number, instanceCount: number) {
        this.bindDescriptorSets();

        const gl = this._gl;

        const indexInput = this._inputAssembler!.indexInput!;

        let type: GLenum;
        let type_bytes: number;
        switch (indexInput.type) {
            case IndexType.UINT16:
                type = gl.UNSIGNED_SHORT;
                type_bytes = 2;
                break;
            case IndexType.UINT32:
                type = gl.UNSIGNED_INT;
                type_bytes = 4;
                break;
            default:
                throw 'unsupported index type';
        }

        gl.drawElementsInstanced(gl.TRIANGLES, indexCount, type, type_bytes * firstIndex, instanceCount);
        gl.bindVertexArray(null);
    }

    endRenderPass() {
        const gl = this._gl;

        for (const attachment of (this._framebuffer.info.resolves as Vector<Texture>).data) {
            if (attachment.info.swapchain) {
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

    private bindDescriptorSets(): void {
        const gl = this._gl;

        for (const [index, descriptorSet] of this._descriptorSets) {
            let dynamicIndex = 0;
            for (const dslb of descriptorSet.layout.info.bindings.data) {
                switch (dslb.descriptorType) {
                    case DescriptorType.SAMPLER_TEXTURE:
                        const texture = descriptorSet.getTexture(dslb.binding);
                        const unit = this._pipeline.info.layout!.getFlatBinding(index, dslb.binding);
                        gl.activeTexture(gl.TEXTURE0 + unit);
                        gl.bindTexture(gl.TEXTURE_2D, texture.texture);

                        const sampler = descriptorSet.getSampler(dslb.binding);
                        gl.bindSampler(unit, sampler.impl);
                        break;
                    case DescriptorType.UNIFORM_BUFFER:
                        gl.bindBufferBase(gl.UNIFORM_BUFFER, this._pipeline.info.layout!.getFlatBinding(index, dslb.binding), descriptorSet.getBuffer(dslb.binding).impl);
                        break;
                    case DescriptorType.UNIFORM_BUFFER_DYNAMIC:
                        const offset = this._dynamicOffsets.get(index)!.data[dynamicIndex++];
                        gl.bindBufferRange(gl.UNIFORM_BUFFER, this._pipeline.info.layout!.getFlatBinding(index, dslb.binding), descriptorSet.getBuffer(dslb.binding).impl, offset, descriptorSet.getBufferRange(dslb.binding));
                        break;
                    default:
                        throw new Error(`unsupported descriptorType: ${dslb.descriptorType}`);
                }
            }
        }
        this._descriptorSets.clear();
        this._dynamicOffsets.clear();
    }
}