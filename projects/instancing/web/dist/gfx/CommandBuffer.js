import { BlendFactor, CullMode, DescriptorType, Format, FormatInfos, IndexType, LOAD_OP, PrimitiveTopology } from "gfx-common";
function bendFactor2WebGL(factor) {
    switch (factor) {
        case BlendFactor.ZERO: return WebGL2RenderingContext.ZERO;
        case BlendFactor.ONE: return WebGL2RenderingContext.ONE;
        case BlendFactor.SRC_ALPHA: return WebGL2RenderingContext.SRC_ALPHA;
        case BlendFactor.DST_ALPHA: return WebGL2RenderingContext.DST_ALPHA;
        case BlendFactor.ONE_MINUS_SRC_ALPHA: return WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA;
        case BlendFactor.ONE_MINUS_DST_ALPHA: return WebGL2RenderingContext.ONE_MINUS_DST_ALPHA;
    }
}
const input2vao = new WeakMap;
export class CommandBuffer {
    constructor(_gl) {
        this._gl = _gl;
    }
    begin() { }
    copyBuffer(srcBuffer, dstBuffer, srcOffset, length) {
        dstBuffer.update(srcBuffer, srcOffset, length);
    }
    copyImageBitmapToTexture(imageBitmap, texture) {
        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, imageBitmap.width, imageBitmap.height, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    beginRenderPass(renderPass, framebuffer, x, y, width, height) {
        const gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.impl);
        this._framebuffer = framebuffer;
        gl.viewport(x, y, width, height);
        gl.scissor(x, y, width, height);
        this._viewport = { x, y, width, height };
        let flag = 0;
        for (const attachment of renderPass.info.colors.data) {
            if (attachment.loadOp == LOAD_OP.CLEAR) {
                gl.clearColor(0, 0, 0, 0);
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
    bindPipeline(pipeline) {
        var _a;
        const gl = this._gl;
        const info = pipeline.info;
        const state = info.passState;
        gl.useProgram(state.shader.impl);
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
        if ((_a = state.depthStencilState) === null || _a === void 0 ? void 0 : _a.depthTestEnable) {
            gl.enable(gl.DEPTH_TEST);
        }
        else {
            gl.disable(gl.DEPTH_TEST);
        }
        const blendState = state.blendState;
        if (blendState) {
            gl.blendFuncSeparate(bendFactor2WebGL(blendState.srcRGB), bendFactor2WebGL(blendState.dstRGB), bendFactor2WebGL(blendState.srcAlpha), bendFactor2WebGL(blendState.dstAlpha));
            gl.enable(gl.BLEND);
        }
        else {
            gl.disable(gl.BLEND);
        }
        this._pipeline = info;
    }
    bindDescriptorSet(index, descriptorSet, dynamicOffsets) {
        const gl = this._gl;
        let dynamicIndex = 0;
        for (const layoutBinding of descriptorSet.layout.info.bindings.data) {
            if (layoutBinding.descriptorType == DescriptorType.UNIFORM_BUFFER) {
                const buffer = descriptorSet.getBuffer(layoutBinding.binding);
                gl.bindBufferBase(gl.UNIFORM_BUFFER, layoutBinding.binding + index * 10, buffer.impl);
            }
            else if (layoutBinding.descriptorType == DescriptorType.UNIFORM_BUFFER_DYNAMIC) {
                const offset = dynamicOffsets.data[dynamicIndex++];
                const buffer = descriptorSet.getBuffer(layoutBinding.binding);
                const range = descriptorSet.getBufferRange(layoutBinding.binding);
                gl.bindBufferRange(gl.UNIFORM_BUFFER, layoutBinding.binding + index * 10, buffer.impl, offset, range);
            }
            else if (layoutBinding.descriptorType == DescriptorType.SAMPLER_TEXTURE) {
                const texture = descriptorSet.getTexture(layoutBinding.binding);
                const unit = index * 2 + layoutBinding.binding;
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, texture.texture);
                const sampler = descriptorSet.getSampler(layoutBinding.binding);
                gl.bindSampler(unit, sampler.impl);
            }
        }
    }
    bindInputAssembler(inputAssembler) {
        this._inputAssembler = inputAssembler;
    }
    draw(vertexCount, instanceCount) {
        this.bindVertexArray();
        const gl = this._gl;
        let mode;
        switch (this._pipeline.passState.primitive) {
            case PrimitiveTopology.LINE_LIST:
                mode = gl.LINES;
                break;
            case PrimitiveTopology.TRIANGLE_LIST:
                mode = gl.TRIANGLES;
                break;
            default:
                throw `unsupported primitive: ${this._pipeline.passState.primitive}`;
        }
        gl.drawArraysInstanced(mode, 0, vertexCount, instanceCount);
        gl.bindVertexArray(null);
    }
    drawIndexed(indexCount, firstIndex, instanceCount) {
        this.bindVertexArray();
        const indexInput = this._inputAssembler.indexInput;
        let type;
        let type_bytes;
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
                throw 'unsupported index type';
        }
        const gl = this._gl;
        gl.drawElementsInstanced(gl.TRIANGLES, indexCount, type, type_bytes * firstIndex, instanceCount);
        gl.bindVertexArray(null);
    }
    endRenderPass() {
        const gl = this._gl;
        for (const attachment of this._framebuffer.info.resolves.data) {
            if (attachment.info.swapchain) {
                gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._framebuffer.impl);
                gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
                gl.blitFramebuffer(this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.y + this._viewport.height, this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.y + this._viewport.height, gl.COLOR_BUFFER_BIT, gl.LINEAR);
            }
        }
    }
    end() { }
    bindVertexArray() {
        const gl = this._gl;
        const inputAssembler = this._inputAssembler;
        let vao = input2vao.get(inputAssembler);
        if (!vao) {
            vao = gl.createVertexArray();
            gl.bindVertexArray(vao);
            const attributes = inputAssembler.vertexAttributes.data;
            for (const attribute of attributes) {
                const buffer = inputAssembler.vertexInput.buffers.data[attribute.buffer];
                const offset = inputAssembler.vertexInput.offsets.data[attribute.buffer];
                const stride = attribute.stride || attributes.reduce((acc, attr) => acc + (attr.buffer == attribute.buffer ? FormatInfos[attr.format].bytes : 0), 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.impl);
                gl.enableVertexAttribArray(attribute.location);
                const formatInfo = FormatInfos[attribute.format];
                let type;
                let isInteger;
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
                        throw 'unsupported vertex type';
                }
                if (isInteger) {
                    gl.vertexAttribIPointer(attribute.location, formatInfo.nums, type, stride, offset + attribute.offset);
                }
                else {
                    gl.vertexAttribPointer(attribute.location, formatInfo.nums, type, false, stride, offset + attribute.offset);
                }
                if (attribute.instanced) {
                    gl.vertexAttribDivisor(attribute.location, 1);
                }
            }
            if (inputAssembler.indexInput) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, inputAssembler.indexInput.buffer.impl);
            }
            input2vao.set(inputAssembler, vao);
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        gl.bindVertexArray(vao);
    }
}
