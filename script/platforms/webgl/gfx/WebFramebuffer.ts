import { Framebuffer, FramebufferInfo } from "../../../core/gfx/Framebuffer.js";
import { TextureUsageBit } from "../../../core/gfx/Texture.js";
import WebTexture from "./WebTexture.js";

export default class WebFramebuffer implements Framebuffer {
    private _gl: WebGL2RenderingContext;

    private _framebuffer: WebGLFramebuffer | null = null;
    get framebuffer(): WebGLFramebuffer | null {
        return this._framebuffer;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(info: FramebufferInfo): boolean {
        const gl = this._gl;

        for (let i = 0; i < info.attachments.length; i++) {
            const attachment = info.attachments[i] as WebTexture;
            if (attachment == gfx.swapchain.colorTexture) {
                return false;
            }
        }

        const framebuffer = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        let COLOR_ATTACHMENTN = gl.COLOR_ATTACHMENT0;
        for (let i = 0; i < info.attachments.length; i++) {
            const attachment = info.attachments[i] as WebTexture;
            if (attachment.info.usage & TextureUsageBit.COLOR_ATTACHMENT) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, COLOR_ATTACHMENTN, gl.TEXTURE_2D, attachment.texture, 0);
                COLOR_ATTACHMENTN++;
            } else if (attachment.info.usage & TextureUsageBit.DEPTH_STENCIL_ATTACHMENT) {
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