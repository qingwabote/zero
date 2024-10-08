#include "gfx/RenderPass.hpp"
#include "RenderPassImpl.hpp"

namespace gfx
{
    RenderPassImpl::RenderPassImpl(DeviceImpl *device) : _device(device) {}

    bool RenderPassImpl::initialize(const RenderPassInfo &info)
    {
        auto gfx_colorAttachments = info.colors.get();
        auto gfx_resolveAttachments = info.resolves.get();

        // renderpass
        VkRenderPassCreateInfo2 renderPassInfo = {VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO_2};

        VkPipelineStageFlags dependency_srcStageMask = VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT;
        VkPipelineStageFlags dependency_dstStageMask = VK_PIPELINE_STAGE_BOTTOM_OF_PIPE_BIT;

        std::vector<VkAttachmentDescription2> attachments;
        // color
        std::vector<VkAttachmentReference2> colorAttachmentRefs(gfx_colorAttachments->size());
        for (uint32_t i = 0; i < gfx_colorAttachments->size(); i++)
        {
            auto gfx_attachment = gfx_colorAttachments->at(i).get();
            VkAttachmentDescription2 attachment{};
            attachment.sType = VK_STRUCTURE_TYPE_ATTACHMENT_DESCRIPTION_2;
            attachment.format = static_cast<VkFormat>(gfx_attachment->format);
            attachment.samples = static_cast<VkSampleCountFlagBits>(info.samples);
            attachment.loadOp = static_cast<VkAttachmentLoadOp>(gfx_attachment->loadOp);
            attachment.initialLayout = static_cast<VkImageLayout>(gfx_attachment->initialLayout);
            attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
            attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
            attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
            attachment.finalLayout = static_cast<VkImageLayout>(gfx_attachment->finalLayout);
            attachments.emplace_back(attachment);

            colorAttachmentRefs[i].sType = VK_STRUCTURE_TYPE_ATTACHMENT_REFERENCE_2;
            colorAttachmentRefs[i].attachment = attachments.size() - 1;
            colorAttachmentRefs[i].layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

            if (gfx_attachment->finalLayout == ImageLayout::SHADER_READ_ONLY)
            {
                // TODO: use VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT | VK_PIPELINE_STAGE_LATE_FRAGMENT_TESTS_BIT in shadow mapping instead
                // https://docs.vulkan.org/guide/latest/synchronization.html#_pipeline_barriers
                dependency_srcStageMask |= VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;

                dependency_dstStageMask |= VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT;
            }
        }

        // depthStencil
        std::unique_ptr<VkAttachmentReference2> depthAttachmentRef;
        VkImageLayout depthFinalLayout{VK_IMAGE_LAYOUT_UNDEFINED};
        if (info.depthStencil)
        {
            auto gfx_depthStencilAttachment = info.depthStencil.get();
            depthFinalLayout = static_cast<VkImageLayout>(gfx_depthStencilAttachment->finalLayout);

            VkAttachmentDescription2 attachment{};
            attachment.sType = VK_STRUCTURE_TYPE_ATTACHMENT_DESCRIPTION_2;
            attachment.flags = 0;
            attachment.format = static_cast<VkFormat>(gfx_depthStencilAttachment->format);
            attachment.samples = static_cast<VkSampleCountFlagBits>(info.samples);
            attachment.loadOp = static_cast<VkAttachmentLoadOp>(gfx_depthStencilAttachment->loadOp);
            attachment.initialLayout = static_cast<VkImageLayout>(gfx_depthStencilAttachment->initialLayout);
            attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
            attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
            attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
            attachment.finalLayout = depthFinalLayout;
            attachments.emplace_back(attachment);

            depthAttachmentRef = std::make_unique<VkAttachmentReference2>();
            depthAttachmentRef->sType = VK_STRUCTURE_TYPE_ATTACHMENT_REFERENCE_2;
            depthAttachmentRef->attachment = attachments.size() - 1;
            depthAttachmentRef->layout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
        }

        std::vector<VkAttachmentReference2> resolveAttachmentRefs(gfx_resolveAttachments->size());
        for (uint32_t i = 0; i < gfx_resolveAttachments->size(); i++)
        {
            auto gfx_attachment = gfx_resolveAttachments->at(i).get();

            VkAttachmentDescription2 attachment{};
            attachment.sType = VK_STRUCTURE_TYPE_ATTACHMENT_DESCRIPTION_2;
            attachment.format = static_cast<VkFormat>(gfx_attachment->format);
            attachment.samples = VK_SAMPLE_COUNT_1_BIT;
            attachment.loadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
            attachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
            attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
            attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
            attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
            attachment.finalLayout = static_cast<VkImageLayout>(gfx_attachment->finalLayout);
            attachments.emplace_back(attachment);

            resolveAttachmentRefs[i].sType = VK_STRUCTURE_TYPE_ATTACHMENT_REFERENCE_2;
            resolveAttachmentRefs[i].attachment = attachments.size() - 1;
            resolveAttachmentRefs[i].layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;
        }

        renderPassInfo.pAttachments = attachments.data();
        renderPassInfo.attachmentCount = attachments.size();

        // we are going to create 1 subpass, which is the minimum you can do
        VkSubpassDescription2 subpass = {};
        subpass.sType = VK_STRUCTURE_TYPE_SUBPASS_DESCRIPTION_2;
        subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
        subpass.pColorAttachments = colorAttachmentRefs.data();
        subpass.colorAttachmentCount = colorAttachmentRefs.size();
        subpass.pDepthStencilAttachment = depthAttachmentRef.get();
        subpass.pResolveAttachments = resolveAttachmentRefs.data();
        renderPassInfo.pSubpasses = &subpass;
        renderPassInfo.subpassCount = 1;

        VkSubpassDependency2 dependency = {VK_STRUCTURE_TYPE_SUBPASS_DEPENDENCY_2};
        dependency.srcSubpass = 0;
        dependency.dstSubpass = VK_SUBPASS_EXTERNAL;
        dependency.srcStageMask = dependency_srcStageMask;
        dependency.dstStageMask = dependency_dstStageMask;

        renderPassInfo.pDependencies = &dependency;
        renderPassInfo.dependencyCount = 1;

        vkCreateRenderPass2(*_device, &renderPassInfo, nullptr, &_renderPass);

        return false;
    }

    RenderPassImpl::~RenderPassImpl()
    {
        vkDestroyRenderPass(*_device, _renderPass, nullptr);
    }

    RenderPass::RenderPass(DeviceImpl *device, const std::shared_ptr<RenderPassInfo> &info) : impl(std::make_unique<RenderPassImpl>(device)), info(info) {}

    bool RenderPass::initialize()
    {
        if (impl->initialize(*info))
        {
            return true;
        }
        return false;
    }

    RenderPass::~RenderPass() {}
}
