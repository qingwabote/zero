#include "bindings/gfx/Framebuffer.hpp"
#include "VkFramebuffer_impl.hpp"
#include "VkTexture_impl.hpp"
#include "VkRenderPass_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        Framebuffer_impl::Framebuffer_impl(Device_impl *device) : _device(device) {}
        Framebuffer_impl::~Framebuffer_impl() {}

        Framebuffer::Framebuffer(std::unique_ptr<Framebuffer_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        bool Framebuffer::initialize(v8::Local<v8::Object> js_info)
        {
            v8::Isolate *isolate = v8::Isolate::GetCurrent();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            auto width = sugar::v8::object_get(js_info, "width").As<v8::Number>()->Value();
            auto height = sugar::v8::object_get(js_info, "height").As<v8::Number>()->Value();
            auto js_attachments = sugar::v8::object_get(js_info, "attachments").As<v8::Array>();
            auto js_renderPass = sugar::v8::object_get(js_info, "renderPass").As<v8::Object>();

            int32_t swapchainAttachmentIdx = -1;
            for (uint32_t i = 0; i < js_attachments->Length(); i++)
            {
                auto js_attachment = js_attachments->Get(context, i).ToLocalChecked().As<v8::Object>();
                if (sugar::v8::object_get(js_attachment, "isSwapchain")->IsUndefined() == false)
                {
                    swapchainAttachmentIdx = i;
                    break;
                }
            }

            _impl->_framebuffers.resize(swapchainAttachmentIdx == -1 ? 1 : _impl->_device->swapchainImageViews().size());
            for (size_t framebufferIdx = 0; framebufferIdx < _impl->_framebuffers.size(); framebufferIdx++)
            {
                VkFramebufferCreateInfo info = {};
                info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
                info.width = width;
                info.height = height;
                info.layers = 1;
                std::vector<VkImageView> attachments(js_attachments->Length());
                for (size_t attachmentIdx = 0; attachmentIdx < attachments.size(); attachmentIdx++)
                {
                    if (attachmentIdx == swapchainAttachmentIdx)
                    {
                        attachments[attachmentIdx] = _impl->_device->swapchainImageViews()[framebufferIdx];
                    }
                    else
                    {
                        auto js_attachment = js_attachments->Get(context, attachmentIdx).ToLocalChecked().As<v8::Object>();
                        attachments[attachmentIdx] = retain<Texture>(js_attachment, "attachment" + attachmentIdx)->impl();
                    }
                }
                info.pAttachments = attachments.data();
                info.attachmentCount = attachments.size();
                info.renderPass = retain<RenderPass>(js_renderPass, "renderPass")->impl();
                vkCreateFramebuffer(*_impl->_device, &info, nullptr, &_impl->_framebuffers[framebufferIdx]);
            }

            return false;
        }

        Framebuffer::~Framebuffer()
        {
            for (size_t i = 0; i < _impl->_framebuffers.size(); i++)
            {
                vkDestroyFramebuffer(*_impl->_device, _impl->_framebuffers[i], nullptr);
            }
        }
    }
}
