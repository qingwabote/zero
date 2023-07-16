#include "gfx/Device.hpp"
#include "VkDevice_impl.hpp"
#include "log.h"

#define VMA_IMPLEMENTATION
#include "vma/vk_mem_alloc.h"

#include "VkSemaphore_impl.hpp"

#include "glslang/Public/ShaderLang.h"

namespace
{
    VKAPI_ATTR VkBool32 VKAPI_CALL debugUtilsMessengerCallback(VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
                                                               VkDebugUtilsMessageTypeFlagsEXT /*messageType*/,
                                                               const VkDebugUtilsMessengerCallbackDataEXT *callbackData,
                                                               void * /*userData*/)
    {
        if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT)
        {
            ZERO_LOG_ERROR("%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
            return VK_FALSE;
        }
        if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT)
        {
            ZERO_LOG_WARN("%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
            return VK_FALSE;
        }
        if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT)
        {
            // ZERO_LOG_INFO("%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
            return VK_FALSE;
        }
        if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT)
        {
            // ZERO_LOG_DEBUG("%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
            return VK_FALSE;
        }
        ZERO_LOG_ERROR("%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
        return VK_FALSE;
    }
}

namespace gfx
{
    bool Device_impl::initialize()
    {
        if (volkInitialize())
        {
            return true;
        }

        VkApplicationInfo appInfo{VK_STRUCTURE_TYPE_APPLICATION_INFO};
        appInfo.apiVersion = version();

        std::vector<const char *> instance_extensions;
        instance_extensions.emplace_back(VK_EXT_DEBUG_UTILS_EXTENSION_NAME);
        instance_extensions.emplace_back(VK_KHR_SURFACE_EXTENSION_NAME);
#if defined(VK_USE_PLATFORM_ANDROID_KHR)
        instance_extensions.emplace_back(VK_KHR_ANDROID_SURFACE_EXTENSION_NAME);
#elif defined(VK_USE_PLATFORM_WIN32_KHR)
        instance_extensions.emplace_back(VK_KHR_WIN32_SURFACE_EXTENSION_NAME);
#else
#pragma error Platform not supported
#endif
        std::vector<const char *> validationLayers{"VK_LAYER_KHRONOS_validation"};

        VkDebugUtilsMessengerCreateInfoEXT debugUtilsCreateInfo{VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT};
        debugUtilsCreateInfo.messageSeverity = VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT |
                                               VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT |
                                               VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT |
                                               VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT;
        debugUtilsCreateInfo.messageType = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
        debugUtilsCreateInfo.pfnUserCallback = debugUtilsMessengerCallback;

        VkInstanceCreateInfo instance_info{VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO};
        instance_info.pApplicationInfo = &appInfo;
        instance_info.enabledExtensionCount = instance_extensions.size();
        instance_info.ppEnabledExtensionNames = instance_extensions.data();
        instance_info.enabledLayerCount = validationLayers.size();
        instance_info.ppEnabledLayerNames = validationLayers.data();
        instance_info.pNext = &debugUtilsCreateInfo;
        VkInstance instance;
        if (vkCreateInstance(&instance_info, nullptr, &instance))
        {
            return true;
        }

        volkLoadInstance(instance);

        vkCreateDebugUtilsMessengerEXT(instance, &debugUtilsCreateInfo, nullptr, &_debugUtilsMessenger);

        VkSurfaceKHR surface = nullptr;
        if (!SDL_Vulkan_CreateSurface(_window, instance, &surface))
        {
            ZERO_LOG("failed to create surface, SDL Error: %s", SDL_GetError());
            return true;
        }

        uint32_t gpu_count = 0;
        vkEnumeratePhysicalDevices(instance, &gpu_count, nullptr);
        std::vector<VkPhysicalDevice> gpus(gpu_count);
        vkEnumeratePhysicalDevices(instance, &gpu_count, gpus.data());

        VkPhysicalDevice gpu{nullptr};
        int32_t queueFamilyIndex = -1;
        for (size_t i = 0; i < gpu_count; i++)
        {
            uint32_t count;
            vkGetPhysicalDeviceQueueFamilyProperties(gpus[i], &count, nullptr);

            std::vector<VkQueueFamilyProperties> properties(count);
            vkGetPhysicalDeviceQueueFamilyProperties(gpus[i], &count, properties.data());

            for (uint32_t i = 0; i < count; i++)
            {
                VkBool32 supports_present;
                vkGetPhysicalDeviceSurfaceSupportKHR(gpus[i], i, surface, &supports_present);

                // Find a queue family which supports graphics and presentation.
                if ((properties[i].queueFlags & VK_QUEUE_GRAPHICS_BIT) && supports_present)
                {
                    queueFamilyIndex = i;
                    break;
                }
            }

            if (queueFamilyIndex != -1)
            {
                gpu = gpus[i];
                break;
            }
        }

        std::vector<const char *> device_extensions{VK_KHR_SWAPCHAIN_EXTENSION_NAME};

        // Create one queue
        float queuePriorities[] = {1.0f};
        VkDeviceQueueCreateInfo queueInfo{VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO};
        queueInfo.queueFamilyIndex = queueFamilyIndex;
        queueInfo.queueCount = 1;
        queueInfo.pQueuePriorities = queuePriorities;

        VkDeviceCreateInfo device_info{VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO};
        device_info.queueCreateInfoCount = 1;
        device_info.pQueueCreateInfos = &queueInfo;
        device_info.enabledExtensionCount = device_extensions.size();
        device_info.ppEnabledExtensionNames = device_extensions.data();
        VkDevice device;
        vkCreateDevice(gpu, &device_info, nullptr, &device);

        volkLoadDevice(device);

        vkGetPhysicalDeviceProperties(gpu, &_gpuProperties);

        vkGetDeviceQueue(device, queueFamilyIndex, 0, &_graphicsQueue);

        // swapchain
        VkSurfaceCapabilitiesKHR surface_properties;
        vkGetPhysicalDeviceSurfaceCapabilitiesKHR(gpu, surface, &surface_properties);

        uint32_t surface_formatCount = 0U;
        vkGetPhysicalDeviceSurfaceFormatsKHR(gpu, surface, &surface_formatCount, nullptr);
        std::vector<VkSurfaceFormatKHR> surface_formats(surface_formatCount);
        vkGetPhysicalDeviceSurfaceFormatsKHR(gpu, surface, &surface_formatCount, surface_formats.data());

        VkSurfaceFormatKHR &surface_format = surface_formats[0];

        VkCompositeAlphaFlagBitsKHR composite{VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR};
        if (surface_properties.supportedCompositeAlpha & VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR)
        {
            composite = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
        }
        else if (surface_properties.supportedCompositeAlpha & VK_COMPOSITE_ALPHA_INHERIT_BIT_KHR)
        {
            composite = VK_COMPOSITE_ALPHA_INHERIT_BIT_KHR;
        }
        else if (surface_properties.supportedCompositeAlpha & VK_COMPOSITE_ALPHA_PRE_MULTIPLIED_BIT_KHR)
        {
            composite = VK_COMPOSITE_ALPHA_PRE_MULTIPLIED_BIT_KHR;
        }
        else if (surface_properties.supportedCompositeAlpha & VK_COMPOSITE_ALPHA_POST_MULTIPLIED_BIT_KHR)
        {
            composite = VK_COMPOSITE_ALPHA_POST_MULTIPLIED_BIT_KHR;
        }

        VkSwapchainCreateInfoKHR swapchainInfo{VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR};
        swapchainInfo.surface = surface;
        swapchainInfo.minImageCount = 3;
        swapchainInfo.imageFormat = surface_format.format;
        swapchainInfo.imageColorSpace = surface_format.colorSpace;
        swapchainInfo.imageExtent = surface_properties.currentExtent;
        swapchainInfo.imageArrayLayers = 1;
        swapchainInfo.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;
        swapchainInfo.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;
        swapchainInfo.preTransform = VK_SURFACE_TRANSFORM_IDENTITY_BIT_KHR;
        swapchainInfo.compositeAlpha = composite;
        swapchainInfo.presentMode = VK_PRESENT_MODE_FIFO_KHR;
        swapchainInfo.clipped = true;
        VkSwapchainKHR swapchain;
        if (vkCreateSwapchainKHR(device, &swapchainInfo, nullptr, &swapchain))
        {
            return true;
        }

        uint32_t imageCount;
        vkGetSwapchainImagesKHR(device, swapchain, &imageCount, nullptr);

        std::vector<VkImage> images(imageCount);
        vkGetSwapchainImagesKHR(device, swapchain, &imageCount, images.data());

        for (VkImage &image : images)
        {
            // Create an image view which we can render into.
            VkImageViewCreateInfo view_info{VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO};
            view_info.viewType = VK_IMAGE_VIEW_TYPE_2D;
            view_info.format = surface_format.format;
            view_info.image = image;
            view_info.subresourceRange.levelCount = 1;
            view_info.subresourceRange.layerCount = 1;
            view_info.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            view_info.components.r = VK_COMPONENT_SWIZZLE_R;
            view_info.components.g = VK_COMPONENT_SWIZZLE_G;
            view_info.components.b = VK_COMPONENT_SWIZZLE_B;
            view_info.components.a = VK_COMPONENT_SWIZZLE_A;

            VkImageView view;
            vkCreateImageView(device, &view_info, nullptr, &view);

            _swapchainImageViews.push_back(view);
        }

        _swapchainImageFormat = surface_format.format;
        _swapchainImageExtent = surface_properties.currentExtent;
        _swapchain = swapchain;
        _surface = surface;

        VmaAllocatorCreateInfo allocatorInfo{};
        allocatorInfo.physicalDevice = gpu;
        allocatorInfo.device = device;
        allocatorInfo.instance = instance;

        VmaVulkanFunctions vmaVulkanFunc{};
        vmaVulkanFunc.vkGetInstanceProcAddr = vkGetInstanceProcAddr;
        vmaVulkanFunc.vkGetDeviceProcAddr = vkGetDeviceProcAddr;

        allocatorInfo.pVulkanFunctions = &vmaVulkanFunc;

        if (vmaCreateAllocator(&allocatorInfo, &_allocator))
        {
            return true;
        }

        // command pool and a buffer
        VkCommandPoolCreateInfo commandPoolInfo{VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO};
        commandPoolInfo.queueFamilyIndex = queueFamilyIndex;
        commandPoolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
        if (vkCreateCommandPool(device, &commandPoolInfo, nullptr, &_commandPool))
        {
            return true;
        }

        _device = device;
        _instance = instance;

        glslang::InitializeProcess();

        return false;
    }

    void Device_impl::acquireNextImage(VkSemaphore semaphore)
    {
        vkAcquireNextImageKHR(_device, _swapchain, 1000000000, semaphore, nullptr, &_swapchainImageIndex);
    }

    Device_impl::~Device_impl()
    {
        glslang::FinalizeProcess();

        vkDestroyCommandPool(_device, _commandPool, nullptr);

        vmaDestroyAllocator(_allocator);

        for (VkImageView &view : _swapchainImageViews)
        {
            vkDestroyImageView(_device, view, nullptr);
        }

        vkDestroySwapchainKHR(_device, _swapchain, nullptr);
        vkDestroyDevice(_device, nullptr);
        vkDestroySurfaceKHR(_instance, _surface, nullptr);
        vkDestroyDebugUtilsMessengerEXT(_instance, _debugUtilsMessenger, nullptr);
        vkDestroyInstance(_instance, nullptr);
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

        _queue = getQueue();

        return false;
    }

    std::unique_ptr<Queue> Device::getQueue() { return std::make_unique<Queue>(_impl); }

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

    void Device::acquire(const std::shared_ptr<Semaphore> &semaphore) { _impl->acquireNextImage(semaphore->impl()); }

    void Device::finish() { vkDeviceWaitIdle(_impl->device()); }

    Device::~Device() { delete _impl; }
}
