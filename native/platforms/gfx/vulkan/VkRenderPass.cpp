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
            uint32_t clearFlags = sugar::v8::object_get(info, "clearFlags").As<v8::Number>()->Value();

            // subpass
            // we are going to create 1 subpass, which is the minimum you can do
            VkSubpassDescription subpass = {};
            subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
            subpass.colorAttachmentCount = 1;

            VkAttachmentReference color_attachment_ref = {};
            // attachment number will index into the pAttachments array in the parent renderpass itself
            color_attachment_ref.attachment = 0;
            color_attachment_ref.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;
            subpass.pColorAttachments = &color_attachment_ref;

            VkAttachmentReference depth_attachment_ref = {};
            depth_attachment_ref.attachment = 1;
            depth_attachment_ref.layout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
            subpass.pDepthStencilAttachment = &depth_attachment_ref;

            // renderpass
            VkRenderPassCreateInfo render_pass_info = {};
            render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;

            // color attachment.
            VkAttachmentDescription color_attachment = {};
            color_attachment.format = _impl->_device->swapchainImageFormat();
            // 1 sample, we won't be doing MSAA
            color_attachment.samples = VK_SAMPLE_COUNT_1_BIT;
            // enum ClearFlagBit {
            //     NONE = 0,
            //     COLOR = 0x1,
            //     DEPTH = 0x2
            // }
            if (clearFlags & 0x1)
            {
                color_attachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
                color_attachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
            }
            else
            {
                color_attachment.loadOp = VK_ATTACHMENT_LOAD_OP_LOAD;
                color_attachment.initialLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;
            }
            // we keep the attachment stored when the renderpass ends
            color_attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
            color_attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
            color_attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
            color_attachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;
            // depth attachment
            VkAttachmentDescription depth_attachment = {};
            depth_attachment.flags = 0;
            depth_attachment.format = _impl->_device->depthFormat();
            depth_attachment.samples = VK_SAMPLE_COUNT_1_BIT;
            if (clearFlags & 0x2)
            {
                depth_attachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
                depth_attachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
            }
            else
            {
                depth_attachment.loadOp = VK_ATTACHMENT_LOAD_OP_LOAD;
                depth_attachment.initialLayout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
            }
            depth_attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
            depth_attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
            depth_attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
            depth_attachment.finalLayout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
            VkAttachmentDescription attachments[2] = {color_attachment, depth_attachment};
            render_pass_info.pAttachments = attachments;
            render_pass_info.attachmentCount = 2;
            render_pass_info.pSubpasses = &subpass;
            render_pass_info.subpassCount = 1;

            // 1 dependency, which is from "outside" into the subpass. And we can read or write color
            VkSubpassDependency dependency = {};
            dependency.srcSubpass = VK_SUBPASS_EXTERNAL;
            dependency.dstSubpass = 0;
            dependency.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
            dependency.srcAccessMask = 0;
            dependency.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
            dependency.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;
            // dependency from outside to the subpass, making this subpass dependent on the previous renderpasses
            VkSubpassDependency depth_dependency = {};
            depth_dependency.srcSubpass = VK_SUBPASS_EXTERNAL;
            depth_dependency.dstSubpass = 0;
            depth_dependency.srcStageMask = VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT | VK_PIPELINE_STAGE_LATE_FRAGMENT_TESTS_BIT;
            depth_dependency.srcAccessMask = 0;
            depth_dependency.dstStageMask = VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT | VK_PIPELINE_STAGE_LATE_FRAGMENT_TESTS_BIT;
            depth_dependency.dstAccessMask = VK_ACCESS_DEPTH_STENCIL_ATTACHMENT_WRITE_BIT;
            VkSubpassDependency dependencies[2] = {dependency, depth_dependency};
            render_pass_info.pDependencies = dependencies;
            render_pass_info.dependencyCount = 2;
            vkCreateRenderPass(_impl->_device->device(), &render_pass_info, nullptr, &_impl->_renderPass);
            return false;
        }

        RenderPass::~RenderPass()
        {
            vkDestroyRenderPass(_impl->_device->device(), _impl->_renderPass, nullptr);
        }
    }
}
