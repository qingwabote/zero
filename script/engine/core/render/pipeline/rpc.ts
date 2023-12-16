import { device } from "boot";
import { AttachmentDescription, ClearFlagBits, FramebufferInfo, ImageLayout, LOAD_OP, RenderPass, RenderPassInfo, TextureUsageBits } from "gfx";

const framebuffer2clearFlags2renderPass: Map<FramebufferInfo, Record<string, RenderPass>> = new Map;

export function getRenderPass(framebuffer: FramebufferInfo, clearFlags = ClearFlagBits.NONE) {
    let clearFlags2renderPass = framebuffer2clearFlags2renderPass.get(framebuffer);
    if (!clearFlags2renderPass) {
        clearFlags2renderPass = {};
        framebuffer2clearFlags2renderPass.set(framebuffer, clearFlags2renderPass);
    }

    let renderPass = clearFlags2renderPass[clearFlags];
    if (renderPass) {
        return renderPass;
    }

    const info = new RenderPassInfo;

    const colorAttachments = framebuffer.colorAttachments;
    for (let i = 0; i < colorAttachments.size(); i++) {
        const colorAttachment = colorAttachments.get(i);
        const description = new AttachmentDescription;
        description.loadOp = clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
        if (colorAttachment == device.swapchain.colorTexture) {
            description.initialLayout = clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC;
            description.finalLayout = ImageLayout.PRESENT_SRC;
        } else {
            description.initialLayout = clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.COLOR_ATTACHMENT_OPTIMAL;
            description.finalLayout = ImageLayout.COLOR_ATTACHMENT_OPTIMAL;
        }
        info.colorAttachments.add(description);
    }

    const resolveAttachments = framebuffer.resolveAttachments;
    for (let i = 0; i < resolveAttachments.size(); i++) {
        // const resolveAttachment = resolveAttachments.get(i);
        const description = new AttachmentDescription;
        description.loadOp = clearFlags & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
        description.initialLayout = clearFlags & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC;
        description.finalLayout = ImageLayout.PRESENT_SRC;
        info.resolveAttachments.add(description);
    }

    const depthStencilAttachment = framebuffer.depthStencilAttachment;
    const depthStencilDescription = new AttachmentDescription();
    depthStencilDescription.loadOp = clearFlags & ClearFlagBits.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
    depthStencilDescription.initialLayout = clearFlags & ClearFlagBits.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
    if (depthStencilAttachment.info.usage & TextureUsageBits.SAMPLED) {
        depthStencilDescription.finalLayout = ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL;
    } else {
        depthStencilDescription.finalLayout = ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
    }
    info.depthStencilAttachment = depthStencilDescription;

    info.samples = depthStencilAttachment.info.samples;

    return clearFlags2renderPass[clearFlags] = renderPass = device.createRenderPass(info);
}