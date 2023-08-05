import { ClearFlagBits, ImageLayout, LOAD_OP, RenderPass, SampleCountFlagBits, impl } from "gfx-main";
import { device } from "../../impl.js";

const clearFlag2renderPass: Record<string, RenderPass> = {};

export function getRenderPass(clearFlags: ClearFlagBits, samples = SampleCountFlagBits.SAMPLE_COUNT_1): RenderPass {
    const hash = `${clearFlags}${samples}`;
    let renderPass = clearFlag2renderPass[hash];
    if (!renderPass) {
        const info = new impl.RenderPassInfo;
        if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            const colorAttachmentDescription = new impl.AttachmentDescription;
            colorAttachmentDescription.loadOp = clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
            colorAttachmentDescription.initialLayout = clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC;
            colorAttachmentDescription.finalLayout = ImageLayout.PRESENT_SRC;
            info.colorAttachments.add(colorAttachmentDescription);
        } else {
            const colorAttachmentDescription = new impl.AttachmentDescription;
            colorAttachmentDescription.loadOp = clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
            colorAttachmentDescription.initialLayout = clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.COLOR_ATTACHMENT_OPTIMAL;
            colorAttachmentDescription.finalLayout = ImageLayout.COLOR_ATTACHMENT_OPTIMAL;
            info.colorAttachments.add(colorAttachmentDescription);
            const resolveAttachmentDescription = new impl.AttachmentDescription;
            resolveAttachmentDescription.loadOp = clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
            resolveAttachmentDescription.initialLayout = clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC;
            resolveAttachmentDescription.finalLayout = ImageLayout.PRESENT_SRC;
            info.resolveAttachments.add(resolveAttachmentDescription);
        }
        const depthStencilAttachment = new impl.AttachmentDescription();
        depthStencilAttachment.loadOp = clearFlags & ClearFlagBits.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
        depthStencilAttachment.initialLayout = clearFlags & ClearFlagBits.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
        depthStencilAttachment.finalLayout = ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
        info.depthStencilAttachment = depthStencilAttachment;
        info.samples = samples;
        renderPass = device.createRenderPass();
        renderPass.initialize(info);
        clearFlag2renderPass[hash] = renderPass;
    }
    return renderPass;
}