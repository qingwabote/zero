#include "bindings/gfx/device.hpp"

#define VMA_IMPLEMENTATION
#include "vma/vk_mem_alloc.h"

#include "VkDevice_impl.hpp"
#include "VkCommandBuffer_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "VkShader_impl.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkPipeline_impl.hpp"

#include "glslang/Public/ShaderLang.h"

namespace binding
{
    namespace gfx
    {

        Device_impl::Device_impl(SDL_Window *window) : _window(window) {}

        Device_impl::~Device_impl() {}

        Device::Device(SDL_Window *window) : Binding(), _impl(new Device_impl(window)) {}

        CommandBuffer *Device::commandBuffer()
        {
            return _impl->_commandBuffer;
        }

        bool Device::initialize()
        {
            _impl->_version = VK_MAKE_API_VERSION(0, 1, 1, 0);

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
                                .require_api_version(_impl->_version)
                                .use_default_debug_messenger()
                                .build();
            _impl->_vkb_instance = inst_ret.value();

            // surface
            if (!SDL_Vulkan_CreateSurface(_impl->_window, _impl->_vkb_instance.instance, &_impl->_surface))
            {
                printf("failed to create surface, SDL Error: %s", SDL_GetError());
                return true;
            }

            // physical device
            vkb::PhysicalDeviceSelector selector{_impl->_vkb_instance};
            vkb::PhysicalDevice physicalDevice = selector
                                                     .set_minimum_version(1, 1)
                                                     .set_surface(_impl->_surface)
                                                     .select()
                                                     .value();

            // logical device
            vkb::DeviceBuilder deviceBuilder{physicalDevice};
            _impl->_vkb_device = deviceBuilder.build().value();

            // swapchain
            vkb::SwapchainBuilder swapchainBuilder{physicalDevice.physical_device, _impl->_vkb_device.device, _impl->_surface};
            _impl->_vkb_swapchain = swapchainBuilder
                                        .use_default_format_selection()
                                        .set_desired_present_mode(VK_PRESENT_MODE_FIFO_KHR)
                                        .build()
                                        .value();

            // queue
            _impl->_graphicsQueue = _impl->_vkb_device.get_queue(vkb::QueueType::graphics).value();
            auto graphicsQueueFamily = _impl->_vkb_device.get_queue_index(vkb::QueueType::graphics).value();

            // command pool and buffer
            VkCommandPoolCreateInfo commandPoolInfo = {};
            commandPoolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
            commandPoolInfo.pNext = nullptr;
            commandPoolInfo.queueFamilyIndex = graphicsQueueFamily;
            commandPoolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
            vkCreateCommandPool(_impl->_vkb_device.device, &commandPoolInfo, nullptr, &_impl->_commandPool);

            _impl->_commandBuffer = new CommandBuffer(std::make_unique<CommandBuffer_impl>(_impl));
            _impl->_commandBuffer->initialize();
            _impl->_js_commandBuffer.Reset(v8::Isolate::GetCurrent(), _impl->_commandBuffer->js());

            // descriptor pool
            std::vector<VkDescriptorPoolSize> descriptorPoolSizes = {{VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER, 10}};
            VkDescriptorPoolCreateInfo descriptorPoolCreateInfo = {};
            descriptorPoolCreateInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
            descriptorPoolCreateInfo.flags = 0;
            descriptorPoolCreateInfo.maxSets = 10;
            descriptorPoolCreateInfo.poolSizeCount = (uint32_t)descriptorPoolSizes.size();
            descriptorPoolCreateInfo.pPoolSizes = descriptorPoolSizes.data();
            vkCreateDescriptorPool(_impl->_vkb_device.device, &descriptorPoolCreateInfo, nullptr, &_impl->_descriptorPool);

            // color attachment.
            VkAttachmentDescription color_attachment = {};
            color_attachment.format = _impl->_vkb_swapchain.image_format;
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
            vkCreateRenderPass(_impl->_vkb_device.device, &render_pass_info, nullptr, &_impl->_renderPass);

            // framebuffers
            VkFramebufferCreateInfo fb_info = {};
            fb_info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
            fb_info.pNext = nullptr;
            fb_info.renderPass = _impl->_renderPass;
            fb_info.attachmentCount = 1;
            fb_info.width = _impl->_vkb_swapchain.extent.width;
            fb_info.height = _impl->_vkb_swapchain.extent.height;
            fb_info.layers = 1;
            _impl->_framebuffers = std::vector<VkFramebuffer>(_impl->_vkb_swapchain.image_count);
            _impl->_swapchainImageViews = _impl->_vkb_swapchain.get_image_views().value();
            for (int i = 0; i < _impl->_vkb_swapchain.image_count; i++)
            {
                fb_info.pAttachments = &_impl->_swapchainImageViews[i];
                vkCreateFramebuffer(_impl->_vkb_device.device, &fb_info, nullptr, &_impl->_framebuffers[i]);
            }

            VmaAllocatorCreateInfo allocatorInfo = {};
            allocatorInfo.physicalDevice = physicalDevice.physical_device;
            allocatorInfo.device = _impl->_vkb_device.device;
            allocatorInfo.instance = _impl->_vkb_instance.instance;
            vmaCreateAllocator(&allocatorInfo, &_impl->_allocator);

            VkFenceCreateInfo fenceCreateInfo = {};
            fenceCreateInfo.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
            fenceCreateInfo.pNext = nullptr;
            fenceCreateInfo.flags = VK_FENCE_CREATE_SIGNALED_BIT;
            vkCreateFence(_impl->_vkb_device.device, &fenceCreateInfo, nullptr, &_impl->_renderFence);

            VkSemaphoreCreateInfo semaphoreCreateInfo = {};
            semaphoreCreateInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;
            semaphoreCreateInfo.pNext = nullptr;
            vkCreateSemaphore(_impl->_vkb_device.device, &semaphoreCreateInfo, nullptr, &_impl->_presentSemaphore);
            vkCreateSemaphore(_impl->_vkb_device.device, &semaphoreCreateInfo, nullptr, &_impl->_renderSemaphore);

            glslang::InitializeProcess();

            return false;
        }

        Buffer *Device::createBuffer()
        {
            return new Buffer(std::make_unique<Buffer_impl>(_impl->_vkb_device.device, _impl->_allocator));
        }

        Shader *Device::createShader() { return new Shader(std::make_unique<Shader_impl>(_impl)); }

        DescriptorSetLayout *Device::createDescriptorSetLayout()
        {
            return new DescriptorSetLayout(std::make_unique<DescriptorSetLayout_impl>(_impl));
        }

        DescriptorSet *Device::createDescriptorSet()
        {
            return new DescriptorSet(std::make_unique<DescriptorSet_impl>(_impl));
        }

        Pipeline *Device::createPipeline()
        {
            return new Pipeline(std::make_unique<Pipeline_impl>(_impl->_vkb_device.device));
        }

        void Device::present()
        {
            vkWaitForFences(_impl->_vkb_device.device, 1, &_impl->_renderFence, true, 1000000000);
            vkResetFences(_impl->_vkb_device.device, 1, &_impl->_renderFence);

            vkAcquireNextImageKHR(_impl->_vkb_device.device, _impl->_vkb_swapchain.swapchain, 1000000000, _impl->_presentSemaphore, nullptr, &_impl->_swapchainImageIndex);
        }

        Device::~Device()
        {
            glslang::FinalizeProcess();

            vkDeviceWaitIdle(_impl->_vkb_device.device);

            vkDestroyFence(_impl->_vkb_device.device, _impl->_renderFence, nullptr);
            vkDestroySemaphore(_impl->_vkb_device.device, _impl->_presentSemaphore, nullptr);
            vkDestroySemaphore(_impl->_vkb_device.device, _impl->_renderSemaphore, nullptr);

            vmaDestroyAllocator(_impl->_allocator);
            for (int i = 0; i < _impl->_framebuffers.size(); i++)
            {
                vkDestroyFramebuffer(_impl->_vkb_device.device, _impl->_framebuffers[i], nullptr);
            }
            vkDestroyRenderPass(_impl->_vkb_device.device, _impl->_renderPass, nullptr);
            _impl->_js_commandBuffer.Reset();
            vkDestroyDescriptorPool(_impl->_vkb_device.device, _impl->_descriptorPool, nullptr);
            vkDestroyCommandPool(_impl->_vkb_device.device, _impl->_commandPool, nullptr);
            for (int i = 0; i < _impl->_swapchainImageViews.size(); i++)
            {
                vkDestroyImageView(_impl->_vkb_device.device, _impl->_swapchainImageViews[i], nullptr);
            }
            vkb::destroy_swapchain(_impl->_vkb_swapchain);
            vkb::destroy_device(_impl->_vkb_device);
            vkb::destroy_surface(_impl->_vkb_instance.instance, _impl->_surface);
            vkb::destroy_instance(_impl->_vkb_instance);

            delete _impl;
        }
    }
}
