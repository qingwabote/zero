import { TextureUsageBit } from "../../../core/gfx/Texture.js";
export default class WebFramebuffer {
    _gl;
    _framebuffer;
    get framebuffer() {
        return this._framebuffer;
    }
    constructor(gl) {
        this._gl = gl;
    }
    initialize(info) {
        const gl = this._gl;
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        let COLOR_ATTACHMENTN = gl.COLOR_ATTACHMENT0;
        for (let i = 0; i < info.attachments.length; i++) {
            const attachment = info.attachments[i];
            if (attachment.info.usage & TextureUsageBit.COLOR_ATTACHMENT) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, COLOR_ATTACHMENTN, gl.TEXTURE_2D, attachment.texture, 0);
                COLOR_ATTACHMENTN++;
            }
            else if (attachment.info.usage & TextureUsageBit.DEPTH_STENCIL_ATTACHMENT) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, attachment.texture, 0);
            }
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
        this._framebuffer = framebuffer;
        return false;
    }
}
//# sourceMappingURL=WebFramebuffer.js.map