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

            // renderpass
            VkRenderPassCreateInfo renderPassInfo = {};
            renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
            std::vector<VkAttachmentDescription> attachmentDescriptions(js_colorAttachments->Length() + 1);
            for (uint32_t i = 0; i < js_colorAttachments->Length(); i++)
            {
                auto js_colorAttachment = js_colorAttachments->Get(context, i).ToLocalChecked().As<v8::Object>();

                attachmentDescriptions[i].format = _impl->_device->swapchainImageFormat();
                // 1 sample, we won't be doing MSAA
                attachmentDescriptions[i].samples = VK_SAMPLE_COUNT_1_BIT;
                attachmentDescriptions[i].loadOp = static_cast<VkAttachmentLoadOp>(sugar::v8::object_get(js_colorAttachment, "loadOp").As<v8::Number>()->Value());
                attachmentDescriptions[i].initialLayout = static_cast<VkImageLayout>(sugar::v8::object_get(js_colorAttachment, "initialLayout").As<v8::Number>()->Value());
                // we keep the attachment stored when the renderpass ends
                attachmentDescriptions[i].storeOp = VK_ATTACHMENT_STORE_OP_STORE;
                attachmentDescriptions[i].stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                attachmentDescriptions[i].stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                attachmentDescriptions[i].finalLayout = static_cast<VkImageLayout>(sugar::v8::object_get(js_colorAttachment, "finalLayout").As<v8::Number>()->Value());
            }

            auto js_depthStencilAttachment = sugar::v8::object_get(info, "depthStencilAttachment").As<v8::Object>();
            VkImageLayout depthFinalLayout = static_cast<VkImageLayout>(sugar::v8::object_get(js_depthStencilAttachment, "finalLayout").As<v8::Number>()->Value());

            uint32_t depthIndex = js_colorAttachments->Length();
            attachmentDescriptions[depthIndex].flags = 0;
            attachmentDescriptions[depthIndex].format = _impl->_device->depthFormat();
            attachmentDescriptions[depthIndex].samples = VK_SAMPLE_COUNT_1_BIT;
            attachmentDescriptions[depthIndex].loadOp = static_cast<VkAttachmentLoadOp>(sugar::v8::object_get(js_depthStencilAttachment, "loadOp").As<v8::Number>()->Value());
            attachmentDescriptions[depthIndex].initialLayout = static_cast<VkImageLayout>(sugar::v8::object_get(js_depthStencilAttachment, "initialLayout").As<v8::Number>()->Value());

            attachmentDescriptions[depthIndex].storeOp = VK_ATTACHMENT_STORE_OP_STORE;
            attachmentDescriptions[depthIndex].stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
            attachmentDescriptions[depthIndex].stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
            attachmentDescriptions[depthIndex].finalLayout = depthFinalLayout;

            renderPassInfo.pAttachments = attachmentDescriptions.data();
            renderPassInfo.attachmentCount = attachmentDescriptions.size();

            // we are going to create 1 subpass, which is the minimum you can do
            VkSubpassDescription subpass = {};
            subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
            std::vector<VkAttachmentReference> colorAttachmentRefs(js_colorAttachments->Length());
            for (uint32_t i = 0; i < colorAttachmentRefs.size(); i++)
            {
                // attachment number will index into the pAttachments array in the parent renderpass itself
                colorAttachmentRefs[i].attachment = i;
                colorAttachmentRefs[i].layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;
            }
            subpass.pColorAttachments = colorAttachmentRefs.data();
            subpass.colorAttachmentCount = colorAttachmentRefs.size();

            VkAttachmentReference depthAttachmentRef = {};
            depthAttachmentRef.attachment = depthIndex;
            depthAttachmentRef.layout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
            subpass.pDepthStencilAttachment = &depthAttachmentRef;
            renderPassInfo.pSubpasses = &subpass;
            renderPassInfo.subpassCount = 1;

            std::vector<VkSubpassDependency> dependencies(2);
            dependencies[0].srcSubpass = VK_SUBPASS_EXTERNAL;
            dependencies[0].dstSubpass = 0;
            dependencies[0].srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
            dependencies[0].srcAccessMask = 0;
            dependencies[0].dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
            dependencies[0].dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;

            dependencies[1].srcSubpass = VK_SUBPASS_EXTERNAL;
            dependencies[1].dstSubpass = 0;
            dependencies[1].srcStageMask = VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT | VK_PIPELINE_STAGE_LATE_FRAGMENT_TESTS_BIT;
            dependencies[1].srcAccessMask = 0;
            dependencies[1].dstStageMask = VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT | VK_PIPELINE_STAGE_LATE_FRAGMENT_TESTS_BIT;
            dependencies[1].dstAccessMask = VK_ACCESS_DEPTH_STENCIL_ATTACHMENT_WRITE_BIT;
            // if (depthFinalLayout == VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL)
            // {
            //     dependencies[0].srcSubpass = VK_SUBPASS_EXTERNAL;
            //     dependencies[0].dstSubpass = 0;
            //     dependencies[0].srcStageMask = VK_PIPELINE_STAGE_BOTTOM_OF_PIPE_BIT;
            //     dependencies[0].dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
            //     dependencies[0].srcAccessMask = VK_ACCESS_MEMORY_READ_BIT;
            //     dependencies[0].dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_READ_BIT | VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;
            //     dependencies[0].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;

            //     dependencies[1].srcSubpass = 0;
            //     dependencies[1].dstSubpass = VK_SUBPASS_EXTERNAL;
            //     dependencies[1].srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
            //     dependencies[1].dstStageMask = VK_PIPELINE_STAGE_BOTTOM_OF_PIPE_BIT;
            //     dependencies[1].srcAccessMask = VK_ACCESS_COLOR_ATTACHMENT_READ_BIT | VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;
            //     dependencies[1].dstAccessMask = VK_ACCESS_MEMORY_READ_BIT;
            //     dependencies[1].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;
            // }
            // else if (depthFinalLayout == VK_IMAGE_LAYOUT_DEPTH_STENCIL_READ_ONLY_OPTIMAL)
            // {
            //     dependencies[0].srcSubpass = VK_SUBPASS_EXTERNAL;
            //     dependencies[0].dstSubpass = 0;
            //     dependencies[0].srcStageMask = VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT;
            //     dependencies[0].dstStageMask = VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT;
            //     dependencies[0].srcAccessMask = VK_ACCESS_SHADER_READ_BIT;
            //     dependencies[0].dstAccessMask = VK_ACCESS_DEPTH_STENCIL_ATTACHMENT_WRITE_BIT;
            //     dependencies[0].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;

            //     dependencies[1].srcSubpass = 0;
            //     dependencies[1].dstSubpass = VK_SUBPASS_EXTERNAL;
            //     dependencies[1].srcStageMask = VK_PIPELINE_STAGE_LATE_FRAGMENT_TESTS_BIT;
            //     dependencies[1].dstStageMask = VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT;
            //     dependencies[1].srcAccessMask = VK_ACCESS_DEPTH_STENCIL_ATTACHMENT_WRITE_BIT;
            //     dependencies[1].dstAccessMask = VK_ACCESS_SHADER_READ_BIT;
            //     dependencies[1].dependencyFlags = VK_DEPENDENCY_BY_REGION_BIT;
            // }
            // else
            // {
            //     throw "not implemented yet";
            // }

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
