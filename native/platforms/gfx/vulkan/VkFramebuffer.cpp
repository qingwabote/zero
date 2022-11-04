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

            VkFramebufferCreateInfo info = {};
            info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
            info.width = width;
            info.height = height;
            info.layers = 1;
            std::vector<VkImageView> attachments(js_attachments->Length());
            for (uint32_t i = 0; i < attachments.size(); i++)
            {
                auto js_attachment = js_attachments->Get(context, i).ToLocalChecked().As<v8::Object>();
                attachments[i] = retain<Texture>(js_attachment, "attachment" + i)->impl();
            }
            info.pAttachments = attachments.data();
            info.attachmentCount = attachments.size();
            info.renderPass = retain<RenderPass>(js_renderPass, "renderPass")->impl();
            vkCreateFramebuffer(*_impl->_device, &info, nullptr, &_impl->_framebuffer);

            return false;
        }

        Framebuffer::~Framebuffer()
        {
            vkDestroyFramebuffer(*_impl->_device, _impl->_framebuffer, nullptr);
        }
    }
}
