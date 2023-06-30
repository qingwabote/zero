#include "bindings/gfx/RenderPass.hpp"
#include "VkRenderPass_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        RenderPass_impl::RenderPass_impl(Device_impl *device) : _device(device) {}
        RenderPass_impl::~RenderPass_impl() {}

        RenderPass::RenderPass(Device_impl *device) : _impl(std::make_unique<RenderPass_impl>(device)) {}

        bool RenderPass::initialize(const std::shared_ptr<RenderPassInfo> &info)
        {
            v8::Isolate *isolate = v8::Isolate::GetCurrent();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            auto gfx_colorAttachments = info->colorAttachments.get();
            auto gfx_resolveAttachments = info->resolveAttachments.get();

            // renderpass
            VkRenderPassCreateInfo2 renderPassInfo = {};
            renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO_2;
            std::vector<VkAttachmentDescription2> attachments(gfx_colorAttachments->size() + 1 + gfx_resolveAttachments->size());
            _impl->_clearValues.resize(gfx_colorAttachments->size() + static_cast<size_t>(1));
            uint32_t attachmentIdx = 0;

            // color
            std::vector<VkAttachmentReference2> colorAttachmentRefs(gfx_colorAttachments->size());
            for (uint32_t i = 0; i < gfx_colorAttachments->size(); i++)
            {
                auto js_attachment = gfx_colorAttachments->at(i).get();
                auto &attachment = attachments[attachmentIdx];
                attachment.sType = VK_STRUCTURE_TYPE_ATTACHMENT_DESCRIPTION_2;
                attachment.format = _impl->_device->swapchainImageFormat();
                attachment.samples = static_cast<VkSampleCountFlagBits>(info->samples);
                attachment.loadOp = static_cast<VkAttachmentLoadOp>(js_attachment->loadOp);
                attachment.initialLayout = static_cast<VkImageLayout>(js_attachment->initialLayout);
                attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
                attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                attachment.finalLayout = static_cast<VkImageLayout>(js_attachment->finalLayout);

                colorAttachmentRefs[i].sType = VK_STRUCTURE_TYPE_ATTACHMENT_REFERENCE_2;
                colorAttachmentRefs[i].attachment = attachmentIdx;
                colorAttachmentRefs[i].layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

                _impl->_clearValues[attachmentIdx].color = {{0.0f, 0.0f, 0.0f, 1.0f}};

                attachmentIdx++;
            }

            // depthStencil
            auto gfx_depthStencilAttachment = info->depthStencilAttachment.get();
            VkImageLayout depthFinalLayout = static_cast<VkImageLayout>(gfx_depthStencilAttachment->finalLayout);

            attachments[attachmentIdx].sType = VK_STRUCTURE_TYPE_ATTACHMENT_DESCRIPTION_2;
            attachments[attachmentIdx].flags = 0;
            attachments[attachmentIdx].format = VK_FORMAT_D32_SFLOAT;
            attachments[attachmentIdx].samples = static_cast<VkSampleCountFlagBits>(info->samples);
            attachments[attachmentIdx].loadOp = static_cast<VkAttachmentLoadOp>(gfx_depthStencilAttachment->loadOp);
            attachments[attachmentIdx].initialLayout = static_cast<VkImageLayout>(gfx_depthStencilAttachment->initialLayout);

            attachments[attachmentIdx].storeOp = VK_ATTACHMENT_STORE_OP_STORE;
            attachments[attachmentIdx].stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
            attachments[attachmentIdx].stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
            attachments[attachmentIdx].finalLayout = depthFinalLayout;

            VkAttachmentReference2 depthAttachmentRef = {};
            depthAttachmentRef.sType = VK_STRUCTURE_TYPE_ATTACHMENT_REFERENCE_2;
            depthAttachmentRef.attachment = attachmentIdx;
            depthAttachmentRef.layout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

            _impl->_clearValues[attachmentIdx].depthStencil.depth = 1;

            attachmentIdx++;

            std::vector<VkAttachmentReference2> resolveAttachmentRefs(gfx_resolveAttachments->size());
            for (uint32_t i = 0; i < gfx_resolveAttachments->size(); i++)
            {
                auto gfx_attachment = gfx_resolveAttachments->at(i).get();

                auto &attachment = attachments[attachmentIdx];
                attachment.sType = VK_STRUCTURE_TYPE_ATTACHMENT_DESCRIPTION_2;
                attachment.format = _impl->_device->swapchainImageFormat();
                attachment.samples = VK_SAMPLE_COUNT_1_BIT;
                attachment.loadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                attachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
                attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
                attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                attachment.finalLayout = static_cast<VkImageLayout>(gfx_attachment->finalLayout);

                resolveAttachmentRefs[i].sType = VK_STRUCTURE_TYPE_ATTACHMENT_REFERENCE_2;
                resolveAttachmentRefs[i].attachment = attachmentIdx;
                resolveAttachmentRefs[i].layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

                attachmentIdx++;
            }

            renderPassInfo.pAttachments = attachments.data();
            renderPassInfo.attachmentCount = attachments.size();

            // we are going to create 1 subpass, which is the minimum you can do
            VkSubpassDescription2 subpass = {};
            subpass.sType = VK_STRUCTURE_TYPE_SUBPASS_DESCRIPTION_2;
            subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
            subpass.pColorAttachments = colorAttachmentRefs.data();
            subpass.colorAttachmentCount = colorAttachmentRefs.size();
            subpass.pDepthStencilAttachment = &depthAttachmentRef;
            subpass.pResolveAttachments = resolveAttachmentRefs.data();
            renderPassInfo.pSubpasses = &subpass;
            renderPassInfo.subpassCount = 1;

            std::vector<VkSubpassDependency2> dependencies(2);
            dependencies[0].sType = VK_STRUCTURE_TYPE_SUBPASS_DEPENDENCY_2;
            dependencies[1].sType = VK_STRUCTURE_TYPE_SUBPASS_DEPENDENCY_2;
            if (depthFinalLayout == VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL)
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
            else if (depthFinalLayout == VK_IMAGE_LAYOUT_DEPTH_STENCIL_READ_ONLY_OPTIMAL)
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
                throw "not implemented yet";
            }

            renderPassInfo.pDependencies = dependencies.data();
            renderPassInfo.dependencyCount = dependencies.size();
            vkCreateRenderPass2(*_impl->_device, &renderPassInfo, nullptr, &_impl->_renderPass);

            _info = info;
            return false;
        }

        RenderPass::~RenderPass()
        {
            vkDestroyRenderPass(*_impl->_device, _impl->_renderPass, nullptr);
        }
    }
}
