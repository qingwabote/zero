#include "gfx/RenderPass.hpp"
#include "VkRenderPass_impl.hpp"

namespace gfx
{
    RenderPass_impl::RenderPass_impl(Device_impl *device) : _device(device) {}

    bool RenderPass_impl::initialize(const RenderPassInfo &info)
    {
        auto gfx_colorAttachments = info.colors.get();
        auto gfx_resolveAttachments = info.resolves.get();

        // renderpass
        VkRenderPassCreateInfo2 renderPassInfo = {};
        renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO_2;

        std::vector<VkAttachmentDescription2> attachments;
        // color
        std::vector<VkAttachmentReference2> colorAttachmentRefs(gfx_colorAttachments->size());
        for (uint32_t i = 0; i < gfx_colorAttachments->size(); i++)
        {
            auto gfx_attachment = gfx_colorAttachments->at(i).get();
            VkAttachmentDescription2 attachment{};
            attachment.sType = VK_STRUCTURE_TYPE_ATTACHMENT_DESCRIPTION_2;
            attachment.format = _device->swapchainImageFormat();
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

            VkClearValue clearValue{};
            clearValue.color = {{0.0f, 0.0f, 0.0f, 1.0f}};
            _clearValues.emplace_back(clearValue);
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
            attachment.format = VK_FORMAT_D32_SFLOAT;
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

            VkClearValue clearValue{};
            clearValue.depthStencil.depth = 1;
            _clearValues.emplace_back(clearValue);
        }

        std::vector<VkAttachmentReference2> resolveAttachmentRefs(gfx_resolveAttachments->size());
        for (uint32_t i = 0; i < gfx_resolveAttachments->size(); i++)
        {
            auto gfx_attachment = gfx_resolveAttachments->at(i).get();

            VkAttachmentDescription2 attachment{};
            attachment.sType = VK_STRUCTURE_TYPE_ATTACHMENT_DESCRIPTION_2;
            attachment.format = _device->swapchainImageFormat();
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

        std::vector<VkSubpassDependency2> dependencies(2);
        dependencies[0].sType = VK_STRUCTURE_TYPE_SUBPASS_DEPENDENCY_2;
        dependencies[1].sType = VK_STRUCTURE_TYPE_SUBPASS_DEPENDENCY_2;
        if (depthFinalLayout == VK_IMAGE_LAYOUT_DEPTH_STENCIL_READ_ONLY_OPTIMAL)
        {
            // https://github.com/SaschaWillems/Vulkan/blob/master/examples/shadowmapping/shadowmapping.cpp
            dependencies[0].srcSubpass = VK_SUBPASS_EXTERNAL;
            dependencies[0].dstSubpass = 0;
            dependencies[0].srcStageMask = VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT;
            dependencies[0].dstStageMask = VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT;
            dependencies[0].srcAccessMask = VK_ACCESS_SHADER_READ_BIT;
            dependencies[0].dstAccessMask = VK_ACCESS_DEPTH_STENCIL_ATTACHMENT_WRITE_BIT;
            dependencies[0].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;

            dependencies[1].srcSubpass = 0;
            dependencies[1].dstSubpass = VK_SUBPASS_EXTERNAL;
            dependencies[1].srcStageMask = VK_PIPELINE_STAGE_LATE_FRAGMENT_TESTS_BIT;
            dependencies[1].dstStageMask = VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT;
            dependencies[1].srcAccessMask = VK_ACCESS_DEPTH_STENCIL_ATTACHMENT_WRITE_BIT;
            dependencies[1].dstAccessMask = VK_ACCESS_SHADER_READ_BIT;
            dependencies[1].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;
        }
        else
        {
            dependencies[0].srcSubpass = VK_SUBPASS_EXTERNAL;
            dependencies[0].dstSubpass = 0;
            dependencies[0].srcStageMask = VK_PIPELINE_STAGE_BOTTOM_OF_PIPE_BIT;
            dependencies[0].dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
            dependencies[0].srcAccessMask = VK_ACCESS_MEMORY_READ_BIT;
            dependencies[0].dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_READ_BIT | VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;
            dependencies[0].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;

            dependencies[1].srcSubpass = 0;
            dependencies[1].dstSubpass = VK_SUBPASS_EXTERNAL;
            dependencies[1].srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
            dependencies[1].dstStageMask = VK_PIPELINE_STAGE_BOTTOM_OF_PIPE_BIT;
            dependencies[1].srcAccessMask = VK_ACCESS_COLOR_ATTACHMENT_READ_BIT | VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;
            dependencies[1].dstAccessMask = VK_ACCESS_MEMORY_READ_BIT;
            dependencies[1].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;
        }

        renderPassInfo.pDependencies = dependencies.data();
        renderPassInfo.dependencyCount = dependencies.size();
        vkCreateRenderPass2(*_device, &renderPassInfo, nullptr, &_renderPass);

        return false;
    }

    RenderPass_impl::~RenderPass_impl()
    {
        vkDestroyRenderPass(*_device, _renderPass, nullptr);
    }

    RenderPass::RenderPass(Device_impl *device) : _impl(std::make_unique<RenderPass_impl>(device)) {}

    bool RenderPass::initialize(const std::shared_ptr<RenderPassInfo> &info)
    {
        if (_impl->initialize(*info))
        {
            return true;
        }

        _info = info;
        return false;
    }

    RenderPass::~RenderPass() {}
}
