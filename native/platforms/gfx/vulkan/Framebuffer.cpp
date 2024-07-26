#include "gfx/Framebuffer.hpp"
#include "FramebufferImpl.hpp"
#include "gfx/Texture.hpp"
#include "TextureImpl.hpp"
#include "gfx/RenderPass.hpp"
#include "RenderPassImpl.hpp"

namespace gfx
{
    FramebufferImpl::FramebufferImpl(DeviceImpl *device) : _device(device) {}
    FramebufferImpl::~FramebufferImpl() {}

    Framebuffer::Framebuffer(DeviceImpl *device, const std::shared_ptr<FramebufferInfo> &info) : impl(std::make_unique<FramebufferImpl>(device)), info(info) {}

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
            if (attachment->impl->swapchain())
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
                if (attachment->impl->swapchain())
                {
                    swapchainAttachment = attachment;
                    break;
                }
            }
        }

        impl->_framebuffers.resize(swapchainAttachment == nullptr ? 1 : impl->_device->swapchainImageViews().size());
        for (size_t framebufferIdx = 0; framebufferIdx < impl->_framebuffers.size(); framebufferIdx++)
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
                    attachments[attachmentIdx] = impl->_device->swapchainImageViews()[framebufferIdx];
                }
                else
                {
                    attachments[attachmentIdx] = *attachment->impl;
                }
                attachmentIdx++;
            }

            attachments[attachmentIdx] = *depthStencilAttachment->impl;
            attachmentIdx++;

            for (size_t idx = 0; idx < resolveAttachments->size(); idx++)
            {
                auto attachment = resolveAttachments->at(idx).get();
                if (attachment == swapchainAttachment)
                {
                    attachments[attachmentIdx] = impl->_device->swapchainImageViews()[framebufferIdx];
                }
                else
                {
                    attachments[attachmentIdx] = *attachment->impl;
                }
                attachmentIdx++;
            }

            info.pAttachments = attachments.data();
            info.attachmentCount = attachments.size();
            info.renderPass = *renderPass->impl;
            vkCreateFramebuffer(*impl->_device, &info, nullptr, &impl->_framebuffers[framebufferIdx]);
        }

        return false;
    }

    Framebuffer::~Framebuffer()
    {
        for (size_t i = 0; i < impl->_framebuffers.size(); i++)
        {
            vkDestroyFramebuffer(*impl->_device, impl->_framebuffers[i], nullptr);
        }
    }
}
