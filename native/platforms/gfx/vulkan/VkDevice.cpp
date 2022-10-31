#include "bindings/gfx/device.hpp"

#define VMA_IMPLEMENTATION
#include "vma/vk_mem_alloc.h"

#include "VkDevice_impl.hpp"
#include "VkCommandBuffer_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "VkTexture_impl.hpp"
#include "VkShader_impl.hpp"
#include "VkRenderPass_impl.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkPipelineLayout_impl.hpp"
#include "VkPipeline_impl.hpp"
#include "VkFence_impl.hpp"
#include "VkSemaphore_impl.hpp"

#include "glslang/Public/ShaderLang.h"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::Object> Device::capabilities()
        {
            return retrieve("capabilities");
        }

        Device::Device(SDL_Window *window) : Binding(), _impl(new Device_impl(window)) {}

        bool Device::initialize()
        {
            _impl->_version = VK_MAKE_API_VERSION(0, 1, 1, 0);

            // instance
            vkb::InstanceBuilder builder;
            auto system_info_ret = vkb::SystemInfo::get_system_info();
            auto &system_info = system_info_ret.value();
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
            auto vkb_instance = inst_ret.value();

            // surface
            VkSurfaceKHR surface = nullptr;
            if (!SDL_Vulkan_CreateSurface(_impl->_window, vkb_instance.instance, &surface))
            {
                printf("failed to create surface, SDL Error: %s", SDL_GetError());
                return true;
            }

            // physical device
            vkb::PhysicalDeviceSelector selector{vkb_instance};
            vkb::PhysicalDevice physicalDevice = selector
                                                     .set_minimum_version(1, 1)
                                                     .set_surface(surface)
                                                     .select()
                                                     .value();

            // logical device
            vkb::DeviceBuilder deviceBuilder{physicalDevice};
            auto vkb_device = deviceBuilder.build().value();
            auto device = vkb_device.device;

            VmaAllocatorCreateInfo allocatorInfo = {};
            allocatorInfo.physicalDevice = physicalDevice.physical_device;
            allocatorInfo.device = device;
            allocatorInfo.instance = vkb_instance.instance;
            vmaCreateAllocator(&allocatorInfo, &_impl->_allocator);

            // swapchain
            vkb::SwapchainBuilder swapchainBuilder{physicalDevice.physical_device, device, surface};
            auto vkb_swapchain = swapchainBuilder
                                     .use_default_format_selection()
                                     .set_desired_present_mode(VK_PRESENT_MODE_FIFO_KHR)
                                     .build()
                                     .value();

            VkFormat depthFormat = VK_FORMAT_D32_SFLOAT;
            VkExtent3D depthImageExtent = {vkb_swapchain.extent.width, vkb_swapchain.extent.height, 1};

            VkImageCreateInfo dimg_info = {};
            dimg_info.sType = VK_STRUCTURE_TYPE_IMAGE_CREATE_INFO;
            dimg_info.imageType = VK_IMAGE_TYPE_2D;
            dimg_info.format = depthFormat;
            dimg_info.extent = depthImageExtent;
            dimg_info.mipLevels = 1;
            dimg_info.arrayLayers = 1;
            dimg_info.samples = VK_SAMPLE_COUNT_1_BIT;
            dimg_info.tiling = VK_IMAGE_TILING_OPTIMAL;
            dimg_info.usage = VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT;

            VkImage depthImage = nullptr;
            VmaAllocation depthImageAllocation = nullptr;
            VmaAllocationCreateInfo dimg_allocinfo = {};
            dimg_allocinfo.usage = VMA_MEMORY_USAGE_GPU_ONLY;
            dimg_allocinfo.requiredFlags = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;
            vmaCreateImage(_impl->_allocator, &dimg_info, &dimg_allocinfo, &depthImage, &depthImageAllocation, nullptr);
            _impl->_depthImageAllocation = depthImageAllocation;

            VkImageView depthImageView = nullptr;
            VkImageViewCreateInfo dview_info = {};
            dview_info.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
            dview_info.viewType = VK_IMAGE_VIEW_TYPE_2D;
            dview_info.image = depthImage;
            dview_info.format = depthFormat;
            dview_info.subresourceRange.baseMipLevel = 0;
            dview_info.subresourceRange.levelCount = 1;
            dview_info.subresourceRange.baseArrayLayer = 0;
            dview_info.subresourceRange.layerCount = 1;
            dview_info.subresourceRange.aspectMask = VK_IMAGE_ASPECT_DEPTH_BIT;
            vkCreateImageView(device, &dview_info, nullptr, &depthImageView);
            _impl->_depthImage = depthImage;
            _impl->_depthFormat = depthFormat;

            VkSamplerCreateInfo samplerInfo = {};
            samplerInfo.sType = VK_STRUCTURE_TYPE_SAMPLER_CREATE_INFO;
            samplerInfo.magFilter = VK_FILTER_NEAREST;
            samplerInfo.minFilter = VK_FILTER_NEAREST;
            samplerInfo.addressModeU = VK_SAMPLER_ADDRESS_MODE_REPEAT;
            samplerInfo.addressModeV = VK_SAMPLER_ADDRESS_MODE_REPEAT;
            samplerInfo.addressModeW = VK_SAMPLER_ADDRESS_MODE_REPEAT;
            vkCreateSampler(device, &samplerInfo, nullptr, &_impl->_defaultSampler);

            // command pool and a buffer
            VkCommandPoolCreateInfo commandPoolInfo = {};
            commandPoolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
            commandPoolInfo.queueFamilyIndex = vkb_device.get_queue_index(vkb::QueueType::graphics).value();
            commandPoolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
            vkCreateCommandPool(device, &commandPoolInfo, nullptr, &_impl->_commandPool);

            // descriptor pool
            std::vector<VkDescriptorPoolSize> descriptorPoolSizes = {
                {VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER, 10}};
            VkDescriptorPoolCreateInfo descriptorPoolCreateInfo = {};
            descriptorPoolCreateInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
            descriptorPoolCreateInfo.flags = 0;
            descriptorPoolCreateInfo.maxSets = 1000;
            descriptorPoolCreateInfo.poolSizeCount = (uint32_t)descriptorPoolSizes.size();
            descriptorPoolCreateInfo.pPoolSizes = descriptorPoolSizes.data();
            vkCreateDescriptorPool(device, &descriptorPoolCreateInfo, nullptr, &_impl->_descriptorPool);

            v8::Local<v8::Object> capabilities = v8::Object::New(v8::Isolate::GetCurrent());
            sugar::v8::object_set(
                capabilities,
                "uniformBufferOffsetAlignment",
                v8::Number::New(v8::Isolate::GetCurrent(), physicalDevice.properties.limits.minUniformBufferOffsetAlignment));
            sugar::v8::object_set(
                capabilities,
                "clipSpaceMinZ",
                v8::Number::New(v8::Isolate::GetCurrent(), 0));
            retain(capabilities, "capabilities");

            _impl->_graphicsQueue = vkb_device.get_queue(vkb::QueueType::graphics).value();
            _impl->_vkb_device = std::move(vkb_device);
            _impl->_vkb_instance = std::move(vkb_instance);
            _impl->_vkb_swapchain = std::move(vkb_swapchain);
            _impl->_surface = surface;

            // device initialization is done, we create some defaults below:

            // default framebuffers
            VkFramebufferCreateInfo fb_info = {};
            fb_info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
            auto src = R"(
                const renderPassInfo = {
                    colorAttachments: [{
                        loadOp: 0,
                        initialLayout: 1,
                        finalLayout: 1
                    }],
                    depthStencilAttachment: {
                        loadOp: 0,
                        initialLayout: 1,
                        finalLayout: 1
                    },
                    hash: ""
                };
                renderPassInfo;
            )";
            auto renderPassInfo = sugar::v8::run(src).As<v8::Object>();
            RenderPass *compatibleRenderPass = createRenderPass();
            compatibleRenderPass->initialize(renderPassInfo);
            fb_info.renderPass = compatibleRenderPass->impl(); // https://github.com/KhronosGroup/Vulkan-Docs/issues/1147
            _impl->_compatibleRenderPass = compatibleRenderPass;

            fb_info.width = _impl->_vkb_swapchain.extent.width;
            fb_info.height = _impl->_vkb_swapchain.extent.height;
            fb_info.layers = 1;
            std::vector<VkFramebuffer> framebuffers(_impl->_vkb_swapchain.image_count);
            std::vector<VkImageView> swapchainImageViews = _impl->_vkb_swapchain.get_image_views().value();
            for (int i = 0; i < _impl->_vkb_swapchain.image_count; i++)
            {
                VkImageView attachments[2];
                attachments[0] = swapchainImageViews[i];
                attachments[1] = depthImageView;
                fb_info.pAttachments = attachments;
                fb_info.attachmentCount = 2;
                vkCreateFramebuffer(device, &fb_info, nullptr, &framebuffers[i]);
            }
            _impl->_swapchainImageViews = std::move(swapchainImageViews);
            _impl->_depthImageView = depthImageView;
            _impl->_framebuffers = std::move(framebuffers);

            glslang::InitializeProcess();

            return false;
        }

        Buffer *Device::createBuffer() { return new Buffer(std::make_unique<Buffer_impl>(_impl)); }

        Texture *Device::createTexture() { return new Texture(std::make_unique<Texture_impl>(_impl)); }

        Shader *Device::createShader() { return new Shader(std::make_unique<Shader_impl>(_impl)); }

        RenderPass *Device::createRenderPass() { return new RenderPass(std::make_unique<RenderPass_impl>(_impl)); }

        DescriptorSetLayout *Device::createDescriptorSetLayout() { return new DescriptorSetLayout(std::make_unique<DescriptorSetLayout_impl>(_impl)); }

        DescriptorSet *Device::createDescriptorSet() { return new DescriptorSet(std::make_unique<DescriptorSet_impl>(_impl)); }

        PipelineLayout *Device::createPipelineLayout() { return new PipelineLayout(std::make_unique<PipelineLayout_impl>(_impl)); }

        Pipeline *Device::createPipeline() { return new Pipeline(std::make_unique<Pipeline_impl>(_impl)); }

        CommandBuffer *Device::createCommandBuffer() { return new CommandBuffer(std::make_unique<CommandBuffer_impl>(_impl)); }

        Semaphore *Device::createSemaphore() { return new Semaphore(std::make_unique<Semaphore_impl>(_impl)); }

        Fence *Device::createFence() { return new Fence(std::make_unique<Fence_impl>(_impl)); }

        void Device::acquire(Semaphore *c_presentSemaphore)
        {
            VkSemaphore semaphore = c_presentSemaphore->impl();
            vkAcquireNextImageKHR(_impl->_vkb_device.device, _impl->_vkb_swapchain.swapchain, 1000000000, semaphore, nullptr, &_impl->_swapchainImageIndex);
        }

        void Device::submit(v8::Local<v8::Object> info, Fence *c_fence)
        {
            VkSubmitInfo submitInfo = {VK_STRUCTURE_TYPE_SUBMIT_INFO};

            auto js_waitDstStageMask = sugar::v8::object_get(info, "waitDstStageMask").As<v8::Number>();
            if (!js_waitDstStageMask->IsUndefined())
            {
                VkPipelineStageFlags waitStage = js_waitDstStageMask->Value();
                submitInfo.pWaitDstStageMask = &waitStage;
            }

            auto js_waitSemaphore = sugar::v8::object_get(info, "waitSemaphore").As<v8::Object>();
            if (!js_waitSemaphore->IsUndefined())
            {
                VkSemaphore waitSemaphore = Binding::c_obj<Semaphore>(js_waitSemaphore)->impl();
                submitInfo.pWaitSemaphores = &waitSemaphore;
                submitInfo.waitSemaphoreCount = 1;
            }

            auto js_signalSemaphore = sugar::v8::object_get(info, "signalSemaphore").As<v8::Object>();
            if (!js_signalSemaphore->IsUndefined())
            {
                VkSemaphore signalSemaphore = Binding::c_obj<Semaphore>(js_signalSemaphore)->impl();
                submitInfo.pSignalSemaphores = &signalSemaphore;
                submitInfo.signalSemaphoreCount = 1;
            }

            auto js_commandBuffer = sugar::v8::object_get(info, "commandBuffer").As<v8::Object>();
            VkCommandBuffer commandBuffer = Binding::c_obj<CommandBuffer>(js_commandBuffer)->impl();
            submitInfo.pCommandBuffers = &commandBuffer;
            submitInfo.commandBufferCount = 1;
            vkQueueSubmit(_impl->_graphicsQueue, 1, &submitInfo, c_fence->impl());
        }

        void Device::present(Semaphore *c_waitSemaphore)
        {
            VkPresentInfoKHR presentInfo = {VK_STRUCTURE_TYPE_PRESENT_INFO_KHR};
            presentInfo.pSwapchains = &_impl->_vkb_swapchain.swapchain;
            presentInfo.swapchainCount = 1;
            VkSemaphore waitSemaphore = c_waitSemaphore->impl();
            presentInfo.pWaitSemaphores = &waitSemaphore;
            presentInfo.waitSemaphoreCount = 1;
            presentInfo.pImageIndices = &_impl->_swapchainImageIndex;
            vkQueuePresentKHR(_impl->_graphicsQueue, &presentInfo);
        }

        void Device::waitFence(Fence *c_fence)
        {
            VkFence fence = c_fence->impl();
            vkWaitForFences(_impl->_vkb_device.device, 1, &fence, true, 1000000000);
            vkResetFences(_impl->_vkb_device.device, 1, &fence);
        }

        void Device::waitIdle()
        {
            vkDeviceWaitIdle(_impl->_vkb_device.device);
        }

        Device::~Device()
        {
            glslang::FinalizeProcess();

            vkb::Device &vkb_device = _impl->_vkb_device;

            vkDestroySampler(vkb_device.device, _impl->_defaultSampler, nullptr);

            vkDestroyDescriptorPool(vkb_device.device, _impl->_descriptorPool, nullptr);
            vkDestroyCommandPool(vkb_device.device, _impl->_commandPool, nullptr);

            delete _impl->_compatibleRenderPass;

            for (int i = 0; i < _impl->_framebuffers.size(); i++)
            {
                vkDestroyFramebuffer(vkb_device.device, _impl->_framebuffers[i], nullptr);
            }

            vkDestroyImageView(vkb_device.device, _impl->_depthImageView, nullptr);

            VmaAllocator allocator = _impl->_allocator;
            vmaDestroyImage(allocator, _impl->_depthImage, _impl->_depthImageAllocation);
            vmaDestroyAllocator(allocator);
            _impl->_allocator = nullptr;

            for (int i = 0; i < _impl->_swapchainImageViews.size(); i++)
            {
                vkDestroyImageView(vkb_device.device, _impl->_swapchainImageViews[i], nullptr);
            }
            vkb::destroy_swapchain(_impl->_vkb_swapchain);
            vkb::destroy_device(vkb_device);

            vkb::destroy_surface(_impl->_vkb_instance.instance, _impl->_surface);
            vkb::destroy_instance(_impl->_vkb_instance);

            delete _impl;
        }
    }
}
