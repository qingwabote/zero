#include "gfx/Device.hpp"
#include "DeviceImpl.hpp"
#include "SDL_log.h"

#define VMA_IMPLEMENTATION
#include "vma/vk_mem_alloc.h"

#include "glslang/Public/ShaderLang.h"

#include "gfx/Fence.hpp"
#include "FenceImpl.hpp"

#include "vulkan/vk_enum_string_helper.h"

namespace
{
    // A callback will always be executed in the same thread as the originating Vulkan call
    // The application should always return VK_FALSE. The VK_TRUE value is reserved for use in layer development
    VKAPI_ATTR VkBool32 VKAPI_CALL debugUtilsMessengerCallback(VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
                                                               VkDebugUtilsMessageTypeFlagsEXT /*messageType*/,
                                                               const VkDebugUtilsMessengerCallbackDataEXT *callbackData,
                                                               void *userData)
    {
        if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT)
        {
            SDL_LogError(0, "%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
        }
        else if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT)
        {
            SDL_LogWarn(0, "%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
        }
        else if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT)
        {
            SDL_LogInfo(0, "%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
        }
        else if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT)
        {
            SDL_LogVerbose(0, "%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
        }
        else
        {
            SDL_LogError(0, "%s: %s", callbackData->pMessageIdName, callbackData->pMessage);
        }
        gfx::DeviceImpl *device = reinterpret_cast<gfx::DeviceImpl *>(userData);
        device->debugMessengerCallback();
        return VK_FALSE;
    }
}

namespace gfx
{
    bool DeviceImpl::initialize()
    {
        if (volkInitialize())
        {
            return true;
        }

        {
            uint32_t v;
            vkEnumerateInstanceVersion(&v);
            SDL_LogInfo(0, "Instance Version: %d.%d.%d", VK_VERSION_MAJOR(v), VK_VERSION_MINOR(v), VK_VERSION_PATCH(v));
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

        std::vector<const char *> validationLayers{
#ifndef NDEBUG
            "VK_LAYER_KHRONOS_validation"
#endif
        };

        VkDebugUtilsMessengerCreateInfoEXT debugUtilsCreateInfo{VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT};
        debugUtilsCreateInfo.messageSeverity =
            // VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT |
            // VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT |
            VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT |
            VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT;
        debugUtilsCreateInfo.messageType =
            VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT |
            VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT |
            VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
        debugUtilsCreateInfo.pfnUserCallback = debugUtilsMessengerCallback;
        debugUtilsCreateInfo.pUserData = this;

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
            SDL_LogError(0, "failed to create surface, SDL Error: %s", SDL_GetError());
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

        vkGetPhysicalDeviceProperties(gpu, &_gpuProperties);
        {
            auto v = _gpuProperties.apiVersion;
            SDL_LogInfo(0, "Device Version: %d.%d.%d", VK_VERSION_MAJOR(v), VK_VERSION_MINOR(v), VK_VERSION_PATCH(v));
        }

        // uint32_t extension_count = 0;
        // vkEnumerateDeviceExtensionProperties(gpu, nullptr, &extension_count, nullptr);
        // std::vector<VkExtensionProperties> extensions_supported(extension_count);
        // vkEnumerateDeviceExtensionProperties(gpu, nullptr, &extension_count, extensions_supported.data());
        // for (auto &&i : extensions_supported)
        // {
        //     SDL_LogInfo(0, "extensions_supported: %s", i.extensionName);
        // }

        std::vector<const char *> device_extensions{
            VK_KHR_SWAPCHAIN_EXTENSION_NAME,
            // VK_EXT_HOST_IMAGE_COPY_EXTENSION_NAME,
        };

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
        // VkPhysicalDeviceHostImageCopyFeaturesEXT hostImageCopyFeatures{VK_STRUCTURE_TYPE_PHYSICAL_DEVICE_HOST_IMAGE_COPY_FEATURES_EXT};
        // hostImageCopyFeatures.hostImageCopy = VK_TRUE;
        // device_info.pNext = &hostImageCopyFeatures;
        VkDevice device;
        {
            auto res = vkCreateDevice(gpu, &device_info, nullptr, &device);
            if (res)
            {
                SDL_LogError(0, "vkCreateDevice %s", string_VkResult(res));
                return true;
            }
        }

        volkLoadDevice(device);

        vkGetDeviceQueue(device, queueFamilyIndex, 0, &_graphicsQueue);

        auto swapchain = new SwapchainImpl(device);
        swapchain->initialize(gpu, surface);
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

        // char *pStatsString = nullptr;
        // vmaBuildStatsString(_allocator, &pStatsString, VK_FALSE);
        // SDL_LogInfo(0, "vmaBuildStatsString: %s", pStatsString);
        // vmaFreeStatsString(_allocator, pStatsString);

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

    DeviceImpl::~DeviceImpl()
    {
        glslang::FinalizeProcess();

        vkDestroyCommandPool(_device, _commandPool, nullptr);

        vmaDestroyAllocator(_allocator);

        delete _swapchain;

        vkDestroyDevice(_device, nullptr);
        vkDestroySurfaceKHR(_instance, _surface, nullptr);
        vkDestroyDebugUtilsMessengerEXT(_instance, _debugUtilsMessenger, nullptr);
        vkDestroyInstance(_instance, nullptr);
    }

    Device::Device(SDL_Window *window, std::function<void()> &&debugMessengerCallback) : _impl(new DeviceImpl(window, std::move(debugMessengerCallback))) {}

    bool Device::initialize()
    {
        if (_impl->initialize())
        {
            return true;
        }

        _capabilities = std::make_unique<Capabilities>(_impl->limits().minUniformBufferOffsetAlignment, 0);

        _swapchain = std::make_unique<Swapchain>(_impl->swapchain());

        _queue = getQueue();

        return false;
    }

    std::unique_ptr<Queue> Device::getQueue() { return std::make_unique<Queue>(_impl); }

    Buffer *Device::createBuffer(const std::shared_ptr<BufferInfo> &info)
    {
        auto buffer = new Buffer(_impl, info);
        buffer->initialize();
        return buffer;
    }

    CommandBuffer *Device::createCommandBuffer()
    {
        auto commandBuffer = new CommandBuffer(_impl);
        commandBuffer->initialize();
        return commandBuffer;
    }

    DescriptorSet *Device::createDescriptorSet(const std::shared_ptr<DescriptorSetLayout> &layout)
    {
        auto descriptorSet = new DescriptorSet(_impl, layout);
        descriptorSet->initialize();
        return descriptorSet;
    }

    DescriptorSetLayout *Device::createDescriptorSetLayout(const std::shared_ptr<DescriptorSetLayoutInfo> &info)
    {
        auto descriptorSetLayout = new DescriptorSetLayout(_impl, info);
        descriptorSetLayout->initialize();
        return descriptorSetLayout;
    }

    Fence *Device::createFence(bool signaled)
    {
        auto fence = new Fence(_impl);
        fence->initialize(signaled);
        return fence;
    }

    Framebuffer *Device::createFramebuffer(const std::shared_ptr<FramebufferInfo> &info)
    {
        auto framebuffer = new Framebuffer(_impl, info);
        framebuffer->initialize();
        return framebuffer;
    }

    Pipeline *Device::createPipeline(const std::shared_ptr<PipelineInfo> &info)
    {
        auto pipeline = new Pipeline(_impl, info);
        pipeline->initialize();
        return pipeline;
    }

    PipelineLayout *Device::createPipelineLayout(const std::shared_ptr<PipelineLayoutInfo> &info)
    {
        auto pipelineLayout = new PipelineLayout(_impl);
        pipelineLayout->initialize(info);
        return pipelineLayout;
    }

    RenderPass *Device::createRenderPass(const std::shared_ptr<RenderPassInfo> &info)
    {
        auto renderPass = new RenderPass(_impl, info);
        renderPass->initialize();
        return renderPass;
    }

    Sampler *Device::createSampler(const std::shared_ptr<SamplerInfo> &info)
    {
        auto sampler = new Sampler(_impl);
        sampler->initialize(info);
        return sampler;
    }

    Semaphore *Device::createSemaphore()
    {
        auto semaphore = new Semaphore(_impl);
        semaphore->initialize();
        return semaphore;
    }

    Shader *Device::createShader(const std::shared_ptr<ShaderInfo> &info)
    {
        auto shader = new Shader(_impl, info);
        if (shader->initialize())
        {
            return nullptr;
        }
        return shader;
    }

    Texture *Device::createTexture(const std::shared_ptr<TextureInfo> &info)
    {
        auto texture = new Texture(_impl, info);
        texture->initialize();
        return texture;
    }

    void Device::waitForFence(const std::shared_ptr<Fence> &c_fence)
    {
        VkFence fence = *c_fence->impl;
        vkWaitForFences(*_impl, 1, &fence, true, 3000000000);
        vkResetFences(*_impl, 1, &fence);
    }

    void Device::finish() { vkDeviceWaitIdle(_impl->device()); }

    Device::~Device() { delete _impl; }
}
