#include "bindings/gfx/device.hpp"

#define VMA_IMPLEMENTATION
#include "vma/vk_mem_alloc.h"

#include "VkDeviceImpl.hpp"
#include "VkCommandBufferImpl.hpp"
#include "VkBufferImpl.hpp"
#include "VkShaderImpl.hpp"
#include "VkPipelineImpl.hpp"

#include "glslang/Public/ShaderLang.h"

namespace binding
{
    namespace gfx
    {

        DeviceImpl::DeviceImpl(SDL_Window *window) : _window(window) {}

        CommandBuffer *DeviceImpl::commandBuffer() { return _commandBuffer; }

        bool DeviceImpl::initialize()
        {
            _version = VK_MAKE_API_VERSION(0, 1, 1, 0);

            // instance
            vkb::InstanceBuilder builder;
            auto system_info_ret = vkb::SystemInfo::get_system_info();
            auto system_info = system_info_ret.value();
            if (system_info.validation_layers_available)
            {
                // Validation layers can only be used if they have been installed onto the system
                // https://vulkan-tutorial.com/Drawing_a_triangle/Setup/Validation_layers
                builder.enable_validation_layers();
            }
            auto inst_ret = builder
                                .set_app_name("_app_name")
                                .require_api_version(_version)
                                .use_default_debug_messenger()
                                .build();
            _vkb_instance = inst_ret.value();

            // surface
            if (!SDL_Vulkan_CreateSurface(_window, _vkb_instance.instance, &_surface))
            {
                printf("failed to create surface, SDL Error: %s", SDL_GetError());
                return true;
            }

            // physical device
            vkb::PhysicalDeviceSelector selector{_vkb_instance};
            vkb::PhysicalDevice physicalDevice = selector
                                                     .set_minimum_version(1, 1)
                                                     .set_surface(_surface)
                                                     .select()
                                                     .value();

            // logical device
            vkb::DeviceBuilder deviceBuilder{physicalDevice};
            _vkb_device = deviceBuilder.build().value();

            // swapchain
            vkb::SwapchainBuilder swapchainBuilder{physicalDevice.physical_device, _vkb_device.device, _surface};
            _vkb_swapchain = swapchainBuilder
                                 .use_default_format_selection()
                                 .set_desired_present_mode(VK_PRESENT_MODE_FIFO_KHR)
                                 .build()
                                 .value();

            // queue
            _graphicsQueue = _vkb_device.get_queue(vkb::QueueType::graphics).value();
            auto graphicsQueueFamily = _vkb_device.get_queue_index(vkb::QueueType::graphics).value();

            // command pool and buffer
            VkCommandPoolCreateInfo commandPoolInfo = {};
            commandPoolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
            commandPoolInfo.pNext = nullptr;
            commandPoolInfo.queueFamilyIndex = graphicsQueueFamily;
            commandPoolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
            vkCreateCommandPool(_vkb_device.device, &commandPoolInfo, nullptr, &_commandPool);

            _commandBuffer = new CommandBuffer(std::make_unique<CommandBufferImpl>(this));
            _js_commandBuffer.Reset(v8::Isolate::GetCurrent(), _commandBuffer->js());

            // color attachment.
            VkAttachmentDescription color_attachment = {};
            color_attachment.format = _vkb_swapchain.image_format;
            // 1 sample, we won't be doing MSAA
            color_attachment.samples = VK_SAMPLE_COUNT_1_BIT;
            // we Clear when this attachment is loaded
            color_attachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
            // we keep the attachment stored when the renderpass ends
            color_attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
            color_attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
            color_attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
            color_attachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
            // after the renderpass ends, the image has to be on a layout ready for display
            color_attachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

            VkAttachmentReference color_attachment_ref = {};
            // attachment number will index into the pAttachments array in the parent renderpass itself
            color_attachment_ref.attachment = 0;
            color_attachment_ref.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

            // subpass
            // we are going to create 1 subpass, which is the minimum you can do
            VkSubpassDescription subpass = {};
            subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
            subpass.colorAttachmentCount = 1;
            subpass.pColorAttachments = &color_attachment_ref;

            // renderpass
            VkRenderPassCreateInfo render_pass_info = {};
            render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
            render_pass_info.attachmentCount = 1;
            render_pass_info.pAttachments = &color_attachment;
            render_pass_info.subpassCount = 1;
            render_pass_info.pSubpasses = &subpass;
            vkCreateRenderPass(_vkb_device.device, &render_pass_info, nullptr, &_renderPass);

            // framebuffers
            VkFramebufferCreateInfo fb_info = {};
            fb_info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
            fb_info.pNext = nullptr;
            fb_info.renderPass = _renderPass;
            fb_info.attachmentCount = 1;
            fb_info.width = _vkb_swapchain.extent.width;
            fb_info.height = _vkb_swapchain.extent.height;
            fb_info.layers = 1;
            _framebuffers = std::vector<VkFramebuffer>(_vkb_swapchain.image_count);
            _swapchainImageViews = _vkb_swapchain.get_image_views().value();
            for (int i = 0; i < _vkb_swapchain.image_count; i++)
            {
                fb_info.pAttachments = &_swapchainImageViews[i];
                vkCreateFramebuffer(_vkb_device.device, &fb_info, nullptr, &_framebuffers[i]);
            }

            VmaAllocatorCreateInfo allocatorInfo = {};
            allocatorInfo.physicalDevice = physicalDevice.physical_device;
            allocatorInfo.device = _vkb_device.device;
            allocatorInfo.instance = _vkb_instance.instance;
            vmaCreateAllocator(&allocatorInfo, &_allocator);

            VkFenceCreateInfo fenceCreateInfo = {};
            fenceCreateInfo.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
            fenceCreateInfo.pNext = nullptr;
            fenceCreateInfo.flags = VK_FENCE_CREATE_SIGNALED_BIT;
            vkCreateFence(_vkb_device.device, &fenceCreateInfo, nullptr, &_renderFence);

            VkSemaphoreCreateInfo semaphoreCreateInfo = {};
            semaphoreCreateInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;
            semaphoreCreateInfo.pNext = nullptr;
            vkCreateSemaphore(_vkb_device.device, &semaphoreCreateInfo, nullptr, &_presentSemaphore);
            vkCreateSemaphore(_vkb_device.device, &semaphoreCreateInfo, nullptr, &_renderSemaphore);

            glslang::InitializeProcess();

            return false;
        }

        Buffer *DeviceImpl::createBuffer() { return new Buffer(std::make_unique<BufferImpl>(_vkb_device.device, _allocator)); }

        Shader *DeviceImpl::createShader() { return new Shader(std::make_unique<ShaderImpl>(this)); }

        Pipeline *DeviceImpl::createPipeline() { return new Pipeline(std::make_unique<PipelineImpl>(_vkb_device.device)); }

        void DeviceImpl::present()
        {
            vkWaitForFences(_vkb_device.device, 1, &_renderFence, true, 1000000000);
            vkResetFences(_vkb_device.device, 1, &_renderFence);
        }

        DeviceImpl::~DeviceImpl()
        {
            glslang::FinalizeProcess();

            vkDeviceWaitIdle(_vkb_device.device);

            vkDestroyFence(_vkb_device.device, _renderFence, nullptr);
            vkDestroySemaphore(_vkb_device.device, _presentSemaphore, nullptr);
            vkDestroySemaphore(_vkb_device.device, _renderSemaphore, nullptr);

            vmaDestroyAllocator(_allocator);
            for (int i = 0; i < _framebuffers.size(); i++)
            {
                vkDestroyFramebuffer(_vkb_device.device, _framebuffers[i], nullptr);
            }
            vkDestroyRenderPass(_vkb_device.device, _renderPass, nullptr);
            _js_commandBuffer.Reset();
            vkDestroyCommandPool(_vkb_device.device, _commandPool, nullptr);
            for (int i = 0; i < _swapchainImageViews.size(); i++)
            {
                vkDestroyImageView(_vkb_device.device, _swapchainImageViews[i], nullptr);
            }
            vkb::destroy_swapchain(_vkb_swapchain);
            vkb::destroy_device(_vkb_device);
            vkb::destroy_surface(_vkb_instance.instance, _surface);
            vkb::destroy_instance(_vkb_instance);
        }

        Device::Device(SDL_Window *window) : Binding(), _impl(new DeviceImpl(window)) {}
        CommandBuffer *Device::commandBuffer() { return _impl->commandBuffer(); }
        bool Device::initialize() { return _impl->initialize(); }
        Buffer *Device::createBuffer() { return _impl->createBuffer(); }
        Shader *Device::createShader() { return _impl->createShader(); }
        Pipeline *Device::createPipeline() { return _impl->createPipeline(); }
        Device::~Device() { delete _impl; }
    }
}
