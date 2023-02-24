import SmartRef from "../../../main/base/SmartRef.js";
import { Framebuffer, FramebufferInfo } from "../../../main/core/gfx/Framebuffer.js";
import { SampleCountFlagBits } from "../../../main/core/gfx/Pipeline.js";
import WebTexture from "./WebTexture.js";

export default class WebFramebuffer implements Framebuffer {
    private _gl: WebGL2RenderingContext;

    private _impl?: SmartRef<WebGLFramebuffer>;
    get impl(): SmartRef<WebGLFramebuffer> | undefined {
        return this._impl;
    }

    private _info!: FramebufferInfo;
    get info(): FramebufferInfo {
        return this._info;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(info: FramebufferInfo): boolean {
        this._info = info;

        const gl = this._gl;

        for (const attachment of info.colorAttachments) {
            if (attachment == gfx.swapchain.colorTexture) {
                return false;
            }
        }

        const framebuffer = new SmartRef(gl.createFramebuffer()!, gl.deleteFramebuffer, gl)
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.deref());

        for (let i = 0; i < info.colorAttachments.length; i++) {
            const attachment = info.colorAttachments[i] as WebTexture;
            if (attachment.info.samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, attachment.texture.deref(), 0);
            } else {
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, attachment.renderbuffer.deref());
            }
        }
        const depthStencilAttachment = info.depthStencilAttachment as WebTexture;
        if (depthStencilAttachment.info.samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthStencilAttachment.texture.deref(), 0);
        } else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthStencilAttachment.renderbuffer.deref());
        }

        // gl.drawBuffers([gl.NONE]);

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            switch (status) {
                case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: {
                    console.error('glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_ATTACHMENT');
                    break;
                }
                case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: {
                    console.error('glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT');
                    break;
                }
                case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: {
                    console.error('glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_DIMENSIONS');
                    break;
                }
                case gl.FRAMEBUFFER_UNSUPPORTED: {
                    console.error('glCheckFramebufferStatus() - FRAMEBUFFER_UNSUPPORTED');
                    break;
                }
                default:
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this._impl = framebuffer;

        return false;
    }

} 