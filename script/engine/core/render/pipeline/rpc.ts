import { device } from "boot";
import { AttachmentDescription, ClearFlagBits, FramebufferInfo, ImageLayout, LOAD_OP, RenderPass, RenderPassInfo, TextureUsageFlagBits } from "gfx";

const framebuffer2clearFlags2renderPass: Map<FramebufferInfo, Record<string, RenderPass>> = new Map;

export function getRenderPass(framebuffer: FramebufferInfo, clears = ClearFlagBits.NONE) {
    let clearFlags2renderPass = framebuffer2clearFlags2renderPass.get(framebuffer);
    if (!clearFlags2renderPass) {
        clearFlags2renderPass = {};
        framebuffer2clearFlags2renderPass.set(framebuffer, clearFlags2renderPass);
    }

    let renderPass = clearFlags2renderPass[clears];
    if (renderPass) {
        return renderPass;
    }

    const info = new RenderPassInfo;

    const colorAttachments = framebuffer.colors;
    for (let i = 0; i < colorAttachments.size(); i++) {
        const attachment = colorAttachments.get(i);
        const description = new AttachmentDescription;
        description.loadOp = clears & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
        if (attachment == device.swapchain.colorTexture) {
            description.initialLayout = clears & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC;
            description.finalLayout = ImageLayout.PRESENT_SRC;
        } else {
            description.initialLayout = clears & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.COLOR;
            description.finalLayout = attachment.info.usage & TextureUsageFlagBits.SAMPLED ? ImageLayout.SHADER_READ_ONLY : ImageLayout.COLOR;
        }
        info.colors.add(description);
    }

    const resolveAttachments = framebuffer.resolves;
    for (let i = 0; i < resolveAttachments.size(); i++) {
        // const resolveAttachment = resolveAttachments.get(i);
        const description = new AttachmentDescription;
        description.loadOp = clears & ClearFlagBits.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
        description.initialLayout = clears & ClearFlagBits.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC;
        description.finalLayout = ImageLayout.PRESENT_SRC;
        info.resolves.add(description);
    }

    const depthStencilAttachment = framebuffer.depthStencil!;
    const depthStencilDescription = new AttachmentDescription();
    depthStencilDescription.loadOp = clears & ClearFlagBits.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD;
    depthStencilDescription.initialLayout = clears & ClearFlagBits.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL;
    depthStencilDescription.finalLayout = depthStencilAttachment.info.usage & TextureUsageFlagBits.SAMPLED ? ImageLayout.DEPTH_STENCIL_READ_ONLY : ImageLayout.DEPTH_STENCIL
    info.depthStencil = depthStencilDescription;

    info.samples = depthStencilAttachment.info.samples;

    return clearFlags2renderPass[clears] = renderPass = device.createRenderPass(info);
}