import { SampleCountFlagBits } from "gfx-common";
import { Texture } from "./Texture.js";
import { FramebufferInfo, Vector } from "./info.js";

export class Framebuffer {
    private _gl: WebGL2RenderingContext;

    private _impl: WebGLFramebuffer | null = null;
    /** null for default framebuffer */
    get impl(): WebGLFramebuffer | null {
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

        const isDefaultFramebuffer = (info.colors as Vector<Texture>).data.find(texture => texture.swapchain) != undefined;
        if (isDefaultFramebuffer) {
            return false;
        }

        const gl = this._gl;

        const framebuffer = gl.createFramebuffer()!
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        for (let i = 0; i < (info.colors as Vector<Texture>).data.length; i++) {
            const attachment = (info.colors as Vector<Texture>).data[i];
            if (attachment.info.samples == SampleCountFlagBits.X1) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, attachment.texture, 0);
            } else {
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, attachment.renderbuffer);
            }
        }
        const depthStencilAttachment = info.depthStencil;
        if (depthStencilAttachment.info.samples == SampleCountFlagBits.X1) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthStencilAttachment.texture, 0);
        } else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthStencilAttachment.renderbuffer);
        }

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
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this._impl = framebuffer;

        return false;
    }

} 