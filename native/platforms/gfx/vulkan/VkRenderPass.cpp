#include "bindings/gfx/RenderPass.hpp"
#include "VkRenderPass_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        RenderPass_impl::RenderPass_impl(Device_impl *device) : _device(device) {}
        RenderPass_impl::~RenderPass_impl() {}

        RenderPass::RenderPass(std::unique_ptr<RenderPass_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        bool RenderPass::initialize(v8::Local<v8::Object> info)
        {
            v8::Isolate *isolate = v8::Isolate::GetCurrent();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            auto js_colorAttachments = sugar::v8::object_get(info, "colorAttachments").As<v8::Array>();
            auto js_resolveAttachments = sugar::v8::object_get(info, "resolveAttachments").As<v8::Array>();
            auto samples = sugar::v8::object_get(info, "samples").As<v8::Number>()->Value();

            // renderpass
            VkRenderPassCreateInfo renderPassInfo = {};
            renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
            std::vector<VkAttachmentDescription> attachments(js_colorAttachments->Length() + 1 + js_resolveAttachments->Length());
            uint32_t attachmentIdx = 0;
            std::vector<VkAttachmentReference> colorAttachmentRefs(js_colorAttachments->Length());
            for (uint32_t i = 0; i < js_colorAttachments->Length(); i++)
            {
                auto js_attachment = js_colorAttachments->Get(context, i).ToLocalChecked().As<v8::Object>();
                auto &attachment = attachments[attachmentIdx];
                attachment.format = _impl->_device->swapchainImageFormat();
                attachment.samples = static_cast<VkSampleCountFlagBits>(samples);
                attachment.loadOp = static_cast<VkAttachmentLoadOp>(sugar::v8::object_get(js_attachment, "loadOp").As<v8::Number>()->Value());
                attachment.initialLayout = static_cast<VkImageLayout>(sugar::v8::object_get(js_attachment, "initialLayout").As<v8::Number>()->Value());
                attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
                attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                attachment.finalLayout = static_cast<VkImageLayout>(sugar::v8::object_get(js_attachment, "finalLayout").As<v8::Number>()->Value());

                colorAttachmentRefs[i].attachment = attachmentIdx;
                colorAttachmentRefs[i].layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

                attachmentIdx++;
            }

            auto js_depthStencilAttachment = sugar::v8::object_get(info, "depthStencilAttachment").As<v8::Object>();
            VkImageLayout depthFinalLayout = static_cast<VkImageLayout>(sugar::v8::object_get(js_depthStencilAttachment, "finalLayout").As<v8::Number>()->Value());

            attachments[attachmentIdx].flags = 0;
            attachments[attachmentIdx].format = VK_FORMAT_D32_SFLOAT;
            attachments[attachmentIdx].samples = static_cast<VkSampleCountFlagBits>(samples);
            attachments[attachmentIdx].loadOp = static_cast<VkAttachmentLoadOp>(sugar::v8::object_get(js_depthStencilAttachment, "loadOp").As<v8::Number>()->Value());
            attachments[attachmentIdx].initialLayout = static_cast<VkImageLayout>(sugar::v8::object_get(js_depthStencilAttachment, "initialLayout").As<v8::Number>()->Value());

            attachments[attachmentIdx].storeOp = VK_ATTACHMENT_STORE_OP_STORE;
            attachments[attachmentIdx].stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
            attachments[attachmentIdx].stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
            attachments[attachmentIdx].finalLayout = depthFinalLayout;

            VkAttachmentReference depthAttachmentRef = {};
            depthAttachmentRef.attachment = attachmentIdx;
            depthAttachmentRef.layout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

            attachmentIdx++;

            std::vector<VkAttachmentReference> resolveAttachmentRefs(js_resolveAttachments->Length());
            for (uint32_t i = 0; i < js_resolveAttachments->Length(); i++)
            {
                auto js_attachment = js_resolveAttachments->Get(context, i).ToLocalChecked().As<v8::Object>();

                auto &attachment = attachments[attachmentIdx];
                attachment.format = _impl->_device->swapchainImageFormat();
                attachment.samples = VK_SAMPLE_COUNT_1_BIT;
                attachment.loadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                attachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
                attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
                attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                attachment.finalLayout = static_cast<VkImageLayout>(sugar::v8::object_get(js_attachment, "finalLayout").As<v8::Number>()->Value());

                resolveAttachmentRefs[i].attachment = attachmentIdx;
                resolveAttachmentRefs[i].layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

                attachmentIdx++;
            }

            renderPassInfo.pAttachments = attachments.data();
            renderPassInfo.attachmentCount = attachments.size();

            // we are going to create 1 subpass, which is the minimum you can do
            VkSubpassDescription subpass = {};
            subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
            subpass.pColorAttachments = colorAttachmentRefs.data();
            subpass.colorAttachmentCount = colorAttachmentRefs.size();
            subpass.pDepthStencilAttachment = &depthAttachmentRef;
            subpass.pResolveAttachments = resolveAttachmentRefs.data();
            renderPassInfo.pSubpasses = &subpass;
            renderPassInfo.subpassCount = 1;

            // https://github.com/SaschaWillems/Vulkan/blob/master/base/vulkanexamplebase.cpp
            std::vector<VkSubpassDependency> dependencies(2);
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
            vkCreateRenderPass(_impl->_device->device(), &renderPassInfo, nullptr, &_impl->_renderPass);
            return false;
        }

        RenderPass::~RenderPass()
        {
            vkDestroyRenderPass(_impl->_device->device(), _impl->_renderPass, nullptr);
        }
    }
}
