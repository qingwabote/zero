import { RecycleQueue } from "bastard";
import { device } from "boot";
import { DescriptorSetLayoutInfo, Format, FramebufferInfo, TextureInfo, TextureUsageFlagBits } from "gfx";
import { shaderLib } from "../../shaderLib.js";
import { getRenderPass } from "./rpc.js";
const descriptorSetLayoutNull = device.createDescriptorSetLayout(new DescriptorSetLayoutInfo);
const defaultFramebuffer = (function () {
    const { width, height } = device.swapchain.color.info;
    const framebufferInfo = new FramebufferInfo;
    framebufferInfo.width = width;
    framebufferInfo.height = height;
    framebufferInfo.colors.add(device.swapchain.color);
    const depthStencilAttachmentInfo = new TextureInfo;
    depthStencilAttachmentInfo.usage = TextureUsageFlagBits.DEPTH_STENCIL;
    depthStencilAttachmentInfo.format = Format.D32_SFLOAT;
    depthStencilAttachmentInfo.width = width;
    depthStencilAttachmentInfo.height = height;
    framebufferInfo.depthStencil = device.createTexture(depthStencilAttachmentInfo);
    framebufferInfo.renderPass = getRenderPass(framebufferInfo);
    return device.createFramebuffer(framebufferInfo);
})();
function pass2batch_create() {
    return new Map;
}
function pass2batch_recycle(value) {
    value.clear();
}
export class Stage {
    constructor(_flow, phases, _framebuffer = defaultFramebuffer, _clears, _rect) {
        this._flow = _flow;
        this.phases = phases;
        this._framebuffer = _framebuffer;
        this._clears = _clears;
        this._rect = _rect;
        this._camera2queue = new WeakMap;
    }
    batch(context, cameraIndex) {
        const camera = context.scene.cameras[cameraIndex];
        let queue = this._camera2queue.get(camera);
        if (!queue) {
            this._camera2queue.set(camera, queue = new RecycleQueue(pass2batch_create, pass2batch_recycle));
        }
        for (const phase of this.phases) {
            if (camera.visibilities & phase.visibility) {
                phase.batch(queue, context, cameraIndex);
            }
        }
    }
    render(context, cameraIndex) {
        var _a, _b;
        const camera = context.scene.cameras[cameraIndex];
        const queue = this._camera2queue.get(camera);
        const renderPass = getRenderPass(this._framebuffer.info, (_a = this._clears) !== null && _a !== void 0 ? _a : camera.clears);
        const rect = (_b = this._rect) !== null && _b !== void 0 ? _b : camera.rect;
        const { width, height } = this._framebuffer.info;
        context.commandBuffer.beginRenderPass(renderPass, this._framebuffer, width * rect[0], height * rect[1], width * rect[2], height * rect[3]);
        let material;
        let pipeline;
        let pass2batches;
        while (pass2batches = queue.front()) {
            for (const [pass, batches] of pass2batches) {
                if (pass.descriptorSet && material != pass.descriptorSet) {
                    context.commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                    material = pass.descriptorSet;
                    context.profile.materials++;
                }
                for (const batch of batches) {
                    if (batch.descriptorSet) {
                        context.commandBuffer.bindDescriptorSet(shaderLib.sets.batch.index, batch.descriptorSet);
                    }
                    const pl = this._flow.getPipeline(pass.state, batch.inputAssembler.vertexInputState, renderPass, [pass.descriptorSetLayout, batch.descriptorSetLayout || descriptorSetLayoutNull]);
                    if (pipeline != pl) {
                        context.commandBuffer.bindPipeline(pl);
                        pipeline = pl;
                        context.profile.pipelines++;
                    }
                    context.commandBuffer.bindInputAssembler(batch.inputAssembler);
                    if (batch.inputAssembler.indexInput) {
                        context.commandBuffer.drawIndexed(batch.draw.count, batch.draw.first, batch.count);
                    }
                    else {
                        context.commandBuffer.draw(batch.draw.count, batch.draw.first, batch.count);
                    }
                    context.profile.draws++;
                }
            }
            queue.pop();
        }
        context.commandBuffer.endRenderPass();
        context.profile.stages++;
    }
}
