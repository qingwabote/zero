#include "bindings/gfx/device.hpp"

#define VMA_IMPLEMENTATION
#include "vma/vk_mem_alloc.h"

#include "VkDevice_impl.hpp"
#include "VkCommandBuffer_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "VkTexture_impl.hpp"
#include "VkShader_impl.hpp"
#include "VkRenderPass_impl.hpp"
#include "VkFramebuffer_impl.hpp"
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
        Device::Device(SDL_Window *window) : Binding(), _impl(new Device_impl(window)) {}

        bool Device::initialize()
        {
            _impl->_version = VK_API_VERSION_1_3;
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
                                                     .set_minimum_version(1, 3)
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

            auto src_js_swapchain = R"(
                const swapchain = {
                    colorTexture: {
                        info: {
                            samples: 1
                        },
                        isSwapchain: true
                    }
                };
                swapchain;
            )";
            auto js_swapchain = sugar::v8::run(src_js_swapchain).As<v8::Object>();
            retain(js_swapchain, "swapchain");

            _impl->_swapchainImageViews = vkb_swapchain.get_image_views().value();
            _impl->_vkb_swapchain = std::move(vkb_swapchain);

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
            descriptorPoolCreateInfo.maxSets = 1000;
            descriptorPoolCreateInfo.poolSizeCount = descriptorPoolSizes.size();
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
            _impl->_surface = surface;

            glslang::InitializeProcess();

            return false;
        }

        Buffer *Device::createBuffer() { return new Buffer(std::make_unique<Buffer_impl>(_impl)); }

        Texture *Device::createTexture() { return new Texture(std::make_unique<Texture_impl>(_impl)); }

        Shader *Device::createShader() { return new Shader(std::make_unique<Shader_impl>(_impl)); }

        RenderPass *Device::createRenderPass() { return new RenderPass(std::make_unique<RenderPass_impl>(_impl)); }

        Framebuffer *Device::createFramebuffer() { return new Framebuffer(std::make_unique<Framebuffer_impl>(_impl)); }

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

            auto js_waitSemaphore = sugar::v8::object_get(info, "waitSemaphore").As<v8::Object>();
            if (!js_waitSemaphore->IsUndefined())
            {
                VkSemaphore waitSemaphore = Binding::c_obj<Semaphore>(js_waitSemaphore)->impl();
                submitInfo.pWaitSemaphores = &waitSemaphore;
                submitInfo.waitSemaphoreCount = 1;
            }

            auto js_waitDstStageMask = sugar::v8::object_get(info, "waitDstStageMask").As<v8::Number>();
            if (!js_waitDstStageMask->IsUndefined())
            {
                VkPipelineStageFlags waitStage = js_waitDstStageMask->Value();
                submitInfo.pWaitDstStageMask = &waitStage;
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

            vmaDestroyAllocator(_impl->_allocator);

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
