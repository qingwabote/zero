import WebBuffer from "./WebBuffer.js";
import WebCommandBuffer from "./WebCommandBuffer.js";
import WebDescriptorSet from "./WebDescriptorSet.js";
import WebDescriptorSetLayout from "./WebDescriptorSetLayout.js";
import WebFence from "./WebFence.js";
import WebFramebuffer from "./WebFramebuffer.js";
import WebPipeline from "./WebPipeline.js";
import WebPipelineLayout from "./WebPipelineLayout.js";
import WebRenderPass from "./WebRenderPass.js";
import WebSemaphore from "./WebSemaphore.js";
import WebShader from "./WebShader.js";
import WebTexture from "./WebTexture.js";
export default class WebDevice {
    _gl;
    _capabilities;
    get capabilities() {
        return this._capabilities;
    }
    constructor(gl) {
        this._capabilities = {
            uniformBufferOffsetAlignment: gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT),
            clipSpaceMinZ: -1
        };
        this._gl = gl;
    }
    initialize() {
        return false;
    }
    createCommandBuffer() {
        return new WebCommandBuffer(this._gl);
    }
    createDescriptorSetLayout() {
        return new WebDescriptorSetLayout();
    }
    createPipelineLayout() {
        return new WebPipelineLayout();
    }
    createDescriptorSet() {
        return new WebDescriptorSet();
    }
    createPipeline() {
        return new WebPipeline();
    }
    createShader() {
        return new WebShader(this._gl);
    }
    createBuffer() {
        return new WebBuffer(this._gl);
    }
    createRenderPass() {
        return new WebRenderPass;
    }
    createFramebuffer() {
        return new WebFramebuffer(this._gl);
    }
    createSemaphore() {
        return new WebSemaphore;
    }
    createTexture() {
        return new WebTexture(this._gl);
    }
    createFence() {
        return new WebFence;
    }
    acquire(semaphore) { }
    submit(info, fence) { }
    present() { }
    waitFence(fence) { }
}
//# sourceMappingURL=WebDevice.js.map