#include "bindings/gfx/Device.hpp"
#include "VkDevice_impl.hpp"
#include "log.h"

#define VMA_IMPLEMENTATION
#include "vma/vk_mem_alloc.h"

#include "VkSemaphore_impl.hpp"

#include "glslang/Public/ShaderLang.h"

namespace
{
    inline VKAPI_ATTR VkBool32 VKAPI_CALL vkb_debug_callback(VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
                                                             VkDebugUtilsMessageTypeFlagsEXT messageType,
                                                             const VkDebugUtilsMessengerCallbackDataEXT *pCallbackData,
                                                             void *)
    {
        auto ms = vkb::to_string_message_severity(messageSeverity);
        auto mt = vkb::to_string_message_type(messageType);
        ZERO_LOG_ERROR("[%s: %s]\n%s", ms, mt, pCallbackData->pMessage);

        return VK_FALSE; // Applications must return false here
    }
}

namespace binding::gfx
{
    bool Device_impl::initialize()
    {
        if (volkInitialize())
        {
            return true;
        }

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
                            .require_api_version(version())
                            .set_debug_callback(vkb_debug_callback)
                            .build();
        if (!inst_ret)
        {
            ZERO_LOG("Failed to create Vulkan instance. Error: %s", inst_ret.error().message().c_str());
            return true;
        }
        auto &vkb_instance = inst_ret.value();

        volkLoadInstanceOnly(vkb_instance.instance);

        // surface
        VkSurfaceKHR surface = nullptr;
        if (!SDL_Vulkan_CreateSurface(_window, vkb_instance.instance, &surface))
        {
            ZERO_LOG("failed to create surface, SDL Error: %s", SDL_GetError());
            return true;
        }

        // physical device
        vkb::PhysicalDeviceSelector selector{vkb_instance};
        auto dev_ret = selector
                           .set_minimum_version(VK_API_VERSION_MAJOR(version()), VK_API_VERSION_MINOR(version()))
                           .set_surface(surface)
                           .select();
        if (!dev_ret)
        {
            ZERO_LOG("Failed to create Vulkan device. Error: %s", dev_ret.error().message().c_str());
            return true;
        }
        vkb::PhysicalDevice physicalDevice = dev_ret.value();

        // logical device
        vkb::DeviceBuilder deviceBuilder{physicalDevice};
        auto device_ret = deviceBuilder.build();
        auto &vkb_device = device_ret.value();
        auto device = vkb_device.device;

        volkLoadDevice(device);

        VmaAllocatorCreateInfo allocatorInfo{};
        allocatorInfo.physicalDevice = physicalDevice.physical_device;
        allocatorInfo.device = device;
        allocatorInfo.instance = vkb_instance.instance;

        VmaVulkanFunctions vmaVulkanFunc{};
        vmaVulkanFunc.vkGetInstanceProcAddr = vkGetInstanceProcAddr;
        vmaVulkanFunc.vkGetDeviceProcAddr = vkGetDeviceProcAddr;

        allocatorInfo.pVulkanFunctions = &vmaVulkanFunc;

        if (vmaCreateAllocator(&allocatorInfo, &_allocator))
        {
            return true;
        }

        // swapchain
        vkb::SwapchainBuilder swapchainBuilder{physicalDevice.physical_device, device, surface};
        auto swapchain_ret = swapchainBuilder
                                 .set_desired_format({VK_FORMAT_B8G8R8A8_UNORM, VK_COLOR_SPACE_SRGB_NONLINEAR_KHR})
                                 .set_desired_present_mode(VK_PRESENT_MODE_FIFO_KHR)
                                 .build();
        auto &vkb_swapchain = swapchain_ret.value();

        _swapchainImageViews = vkb_swapchain.get_image_views().value();
        _vkb_swapchain = std::move(vkb_swapchain);

        // command pool and a buffer
        VkCommandPoolCreateInfo commandPoolInfo = {};
        commandPoolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
        commandPoolInfo.queueFamilyIndex = vkb_device.get_queue_index(vkb::QueueType::graphics).value();
        commandPoolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
        if (vkCreateCommandPool(device, &commandPoolInfo, nullptr, &_commandPool))
        {
            return true;
        }

        _graphicsQueue = vkb_device.get_queue(vkb::QueueType::graphics).value();

        _vkb_physicalDevice = std::move(physicalDevice);
        _vkb_device = std::move(vkb_device);
        _vkb_instance = std::move(vkb_instance);
        _surface = surface;

        glslang::InitializeProcess();

        return false;
    }

    void Device_impl::acquireNextImage(VkSemaphore semaphore)
    {
        vkAcquireNextImageKHR(_vkb_device.device, _vkb_swapchain.swapchain, 1000000000, semaphore, nullptr, &_swapchainImageIndex);
    }

    Device_impl::~Device_impl()
    {
        glslang::FinalizeProcess();

        vkDestroyCommandPool(_vkb_device.device, _commandPool, nullptr);

        vmaDestroyAllocator(_allocator);

        for (int i = 0; i < _swapchainImageViews.size(); i++)
        {
            vkDestroyImageView(_vkb_device.device, _swapchainImageViews[i], nullptr);
        }

        vkb::destroy_swapchain(_vkb_swapchain);
        vkb::destroy_device(_vkb_device);

        vkb::destroy_surface(_vkb_instance.instance, _surface);
        vkb::destroy_instance(_vkb_instance);
    }

    Device::Device(SDL_Window *window) : _impl(new Device_impl(window)) {}

    bool Device::initialize()
    {
        if (_impl->initialize())
        {
            return true;
        }

        _capabilities = std::make_unique<Capabilities>(_impl->limits().minUniformBufferOffsetAlignment, 0);

        auto swapchain_color_info = std::make_shared<TextureInfo>();
        swapchain_color_info->samples = SampleCountFlagBits::SAMPLE_COUNT_1;
        auto swapchain_color = std::make_shared<Texture>(_impl, true);
        swapchain_color->initialize(swapchain_color_info);
        _swapchain = std::make_unique<Swapchain>(std::move(swapchain_color));

        _queue = std::unique_ptr<Queue>(createQueue());

        return false;
    }

    Buffer *Device::createBuffer() { return new Buffer(_impl); }

    Texture *Device::createTexture() { return new Texture(_impl); }

    Sampler *Device::createSampler() { return new Sampler(_impl); }

    Shader *Device::createShader() { return new Shader(_impl); }

    RenderPass *Device::createRenderPass() { return new RenderPass(_impl); }

    Framebuffer *Device::createFramebuffer() { return new Framebuffer(_impl); }

    DescriptorSetLayout *Device::createDescriptorSetLayout() { return new DescriptorSetLayout(_impl); }

    DescriptorSet *Device::createDescriptorSet() { return new DescriptorSet(_impl); }

    InputAssembler *Device::createInputAssembler() { return new InputAssembler(_impl); }

    PipelineLayout *Device::createPipelineLayout() { return new PipelineLayout(_impl); }

    Pipeline *Device::createPipeline() { return new Pipeline(_impl); }

    CommandBuffer *Device::createCommandBuffer() { return new CommandBuffer(_impl); }

    Semaphore *Device::createSemaphore() { return new Semaphore(_impl); }

    Fence *Device::createFence() { return new Fence(_impl); }

    Queue *Device::createQueue() { return new Queue(_impl); }

    void Device::acquire(const std::shared_ptr<Semaphore> &c_presentSemaphore)
    {
        VkSemaphore semaphore = c_presentSemaphore->impl();
        _impl->acquireNextImage(semaphore);
    }

    void Device::finish()
    {
        vkDeviceWaitIdle(_impl->device());
    }

    Device::~Device()
    {
        delete _impl;
    }
}
