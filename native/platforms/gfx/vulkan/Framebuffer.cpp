#include "gfx/Framebuffer.hpp"
#include "Framebuffer_impl.hpp"
#include "gfx/Texture.hpp"
#include "Texture_impl.hpp"
#include "gfx/RenderPass.hpp"
#include "RenderPass_impl.hpp"

namespace gfx
{
    Framebuffer_impl::Framebuffer_impl(Device_impl *device) : _device(device) {}
    Framebuffer_impl::~Framebuffer_impl() {}

    Framebuffer::Framebuffer(Device_impl *device, const std::shared_ptr<FramebufferInfo> &info) : _impl(std::make_unique<Framebuffer_impl>(device)), info(info) {}

    bool Framebuffer::initialize()
    {
        auto width = info->width;
        auto height = info->height;
        auto colorAttachments = info->colors.get();
        auto depthStencilAttachment = info->depthStencil.get();
        auto resolveAttachments = info->resolves.get();
        auto renderPass = info->renderPass;

        Texture *swapchainAttachment = nullptr;
        for (uint32_t i = 0; i < colorAttachments->size(); i++)
        {
            auto attachment = colorAttachments->at(i).get();
            if (attachment->impl()->swapchain())
            {
                swapchainAttachment = attachment;
                break;
            }
        }
        if (!swapchainAttachment)
        {
            for (uint32_t i = 0; i < resolveAttachments->size(); i++)
            {
                auto attachment = resolveAttachments->at(i).get();
                if (attachment->impl()->swapchain())
                {
                    swapchainAttachment = attachment;
                    break;
                }
            }
        }

        _impl->_framebuffers.resize(swapchainAttachment == nullptr ? 1 : _impl->_device->swapchainImageViews().size());
        for (size_t framebufferIdx = 0; framebufferIdx < _impl->_framebuffers.size(); framebufferIdx++)
        {
            VkFramebufferCreateInfo info = {};
            info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
            info.width = width;
            info.height = height;
            info.layers = 1;
            std::vector<VkImageView> attachments(colorAttachments->size() + 1 + resolveAttachments->size());
            uint32_t attachmentIdx = 0;
            for (size_t idx = 0; idx < colorAttachments->size(); idx++)
            {
                auto attachment = colorAttachments->at(idx).get();
                if (attachment == swapchainAttachment)
                {
                    attachments[attachmentIdx] = _impl->_device->swapchainImageViews()[framebufferIdx];
                }
                else
                {
                    attachments[attachmentIdx] = *attachment->impl();
                }
                attachmentIdx++;
            }

            attachments[attachmentIdx] = *depthStencilAttachment->impl();
            attachmentIdx++;

            for (size_t idx = 0; idx < resolveAttachments->size(); idx++)
            {
                auto attachment = resolveAttachments->at(idx).get();
                if (attachment == swapchainAttachment)
                {
                    attachments[attachmentIdx] = _impl->_device->swapchainImageViews()[framebufferIdx];
                }
                else
                {
                    attachments[attachmentIdx] = *attachment->impl();
                }
                attachmentIdx++;
            }

            info.pAttachments = attachments.data();
            info.attachmentCount = attachments.size();
            info.renderPass = renderPass->impl();
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
