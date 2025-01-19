import { SampleCountFlagBits } from "./shared/constants.js";
export class Framebuffer {
    /** null for default framebuffer */
    get impl() {
        return this._impl;
    }
    constructor(_gl, info) {
        this._gl = _gl;
        this.info = info;
        this._impl = null;
    }
    initialize() {
        const isDefaultFramebuffer = this.info.colors.data.find(texture => texture.info.swapchain) != undefined;
        if (isDefaultFramebuffer) {
            return false;
        }
        const gl = this._gl;
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        for (let i = 0; i < this.info.colors.data.length; i++) {
            const attachment = this.info.colors.data[i];
            if (attachment.info.samples == SampleCountFlagBits.X1) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, attachment.texture, 0);
            }
            else {
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, attachment.renderbuffer);
            }
        }
        const depthStencilAttachment = this.info.depthStencil;
        if (depthStencilAttachment.info.samples == SampleCountFlagBits.X1) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthStencilAttachment.texture, 0);
        }
        else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthStencilAttachment.renderbuffer);
        }
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            switch (status) {
                case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: {
                    throw 'glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
                }
                case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: {
                    throw 'glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
                }
                case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: {
                    throw 'glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
                }
                case gl.FRAMEBUFFER_UNSUPPORTED: {
                    throw 'glCheckFramebufferStatus() - FRAMEBUFFER_UNSUPPORTED';
                }
            }
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this._impl = framebuffer;
        return false;
    }
}
