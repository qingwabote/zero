import { Framebuffer } from "../../../main/core/gfx/Framebuffer.js";
import Texture from "../../../main/core/gfx/Texture.js";
import { FramebufferInfo, SampleCountFlagBits } from "../../../main/core/gfx/info.js";
import WebTexture from "./WebTexture.js";
import { WebVector } from "./info.js";

export default class WebFramebuffer implements Framebuffer {
    private _gl: WebGL2RenderingContext;

    private _impl?: WebGLFramebuffer;
    get impl(): WebGLFramebuffer | undefined {
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

        const isDefaultFramebuffer = (info.colorAttachments as WebVector<Texture>).data.find(texture => (texture as WebTexture).swapchain) != undefined;
        if (isDefaultFramebuffer) {
            return false;
        }

        const gl = this._gl;

        const framebuffer = gl.createFramebuffer()!
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        for (let i = 0; i < (info.colorAttachments as WebVector<Texture>).data.length; i++) {
            const attachment = (info.colorAttachments as WebVector<Texture>).data[i] as WebTexture;
            if (attachment.info.samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, attachment.texture, 0);
            } else {
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, attachment.renderbuffer);
            }
        }
        const depthStencilAttachment = info.depthStencilAttachment as WebTexture;
        if (depthStencilAttachment.info.samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthStencilAttachment.texture, 0);
        } else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthStencilAttachment.renderbuffer);
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