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
            auto js_colorAttachments = sugar::v8::object_get(js_info, "colorAttachments").As<v8::Array>();
            auto js_depthStencilAttachment = sugar::v8::object_get(js_info, "depthStencilAttachment").As<v8::Object>();
            auto js_resolveAttachments = sugar::v8::object_get(js_info, "resolveAttachments").As<v8::Array>();
            auto js_renderPass = sugar::v8::object_get(js_info, "renderPass").As<v8::Object>();

            v8::Local<v8::Object> swapchainAttachment;
            for (uint32_t i = 0; i < js_colorAttachments->Length(); i++)
            {
                auto js_attachment = js_colorAttachments->Get(context, i).ToLocalChecked().As<v8::Object>();
                if (sugar::v8::object_get(js_attachment, "isSwapchain")->IsUndefined() == false)
                {
                    swapchainAttachment = js_attachment;
                    break;
                }
            }
            if (swapchainAttachment.IsEmpty())
            {
                for (uint32_t i = 0; i < js_resolveAttachments->Length(); i++)
                {
                    auto js_attachment = js_resolveAttachments->Get(context, i).ToLocalChecked().As<v8::Object>();
                    if (sugar::v8::object_get(js_attachment, "isSwapchain")->IsUndefined() == false)
                    {
                        swapchainAttachment = js_attachment;
                        break;
                    }
                }
            }

            _impl->_framebuffers.resize(swapchainAttachment.IsEmpty() ? 1 : _impl->_device->swapchainImageViews().size());
            for (size_t framebufferIdx = 0; framebufferIdx < _impl->_framebuffers.size(); framebufferIdx++)
            {
                VkFramebufferCreateInfo info = {};
                info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
                info.width = width;
                info.height = height;
                info.layers = 1;
                std::vector<VkImageView> attachments(js_colorAttachments->Length() + 1 + js_resolveAttachments->Length());
                uint32_t attachmentIdx = 0;
                for (size_t idx = 0; idx < js_colorAttachments->Length(); idx++)
                {
                    auto js_attachment = js_colorAttachments->Get(context, idx).ToLocalChecked().As<v8::Object>();

                    if (js_attachment->Equals(context, swapchainAttachment).FromMaybe(false))
                    {
                        attachments[attachmentIdx] = _impl->_device->swapchainImageViews()[framebufferIdx];
                    }
                    else
                    {
                        attachments[attachmentIdx] = Binding::c_obj<Texture>(js_attachment)->impl();
                    }
                    attachmentIdx++;
                }

                attachments[attachmentIdx] = Binding::c_obj<Texture>(js_depthStencilAttachment)->impl();
                attachmentIdx++;

                for (size_t idx = 0; idx < js_resolveAttachments->Length(); idx++)
                {
                    auto js_attachment = js_resolveAttachments->Get(context, idx).ToLocalChecked().As<v8::Object>();

                    if (js_attachment->Equals(context, swapchainAttachment).FromMaybe(false))
                    {
                        attachments[attachmentIdx] = _impl->_device->swapchainImageViews()[framebufferIdx];
                    }
                    else
                    {
                        attachments[attachmentIdx] = Binding::c_obj<Texture>(js_attachment)->impl();
                    }
                    attachmentIdx++;
                }

                info.pAttachments = attachments.data();
                info.attachmentCount = attachments.size();
                info.renderPass = Binding::c_obj<RenderPass>(js_renderPass)->impl();
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
