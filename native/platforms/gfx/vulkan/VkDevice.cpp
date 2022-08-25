#include "bindings/gfx/device.hpp"
#include "VkBootstrap.h"
#include "SDL_vulkan.h"

namespace binding
{
    namespace gfx
    {
        class Device::Impl
        {
        private:
            v8::Isolate *_isolate = nullptr;
            SDL_Window *_window = nullptr;
            vkb::Instance _vkb_instance;
            VkSurfaceKHR _surface = nullptr;
            vkb::Device _vkb_device;
            vkb::DispatchTable _dispatchTable;
            vkb::Swapchain _vkb_swapchain;
            VkQueue _graphicsQueue = nullptr;
            VkCommandPool _commandPool = nullptr;
            CommandBuffer *_commandBuffer = nullptr;

        public:
            Impl(v8::Isolate *isolate, SDL_Window *window) : _isolate(isolate), _window(window) {}

            CommandBuffer *commandBuffer()
            {
                return _commandBuffer;
            }

            bool initialize()
            {
                vkb::InstanceBuilder builder;

                auto system_info_ret = vkb::SystemInfo::get_system_info();
                // if (!system_info_ret)
                // {
                //     printf("%s\n", system_info_ret.error().message().c_str());
                //     return -1;
                // }
                auto system_info = system_info_ret.value();
                if (system_info.validation_layers_available)
                {
                    // Validation layers can only be used if they have been installed onto the system
                    // https://vulkan-tutorial.com/Drawing_a_triangle/Setup/Validation_layers
                    builder.enable_validation_layers();
                }

                auto inst_ret = builder
                                    .set_app_name("_app_name")
                                    .require_api_version(1, 1, 0)
                                    .use_default_debug_messenger()
                                    .build();
                if (!inst_ret)
                {
                    printf("failed to create Vulkan instance. Error: %s\n", inst_ret.error().message().c_str());
                    return true;
                }

                _vkb_instance = inst_ret.value();

                if (!SDL_Vulkan_CreateSurface(_window, _vkb_instance.instance, &_surface))
                {
                    printf("failed to create surface, SDL Error: %s", SDL_GetError());
                    return true;
                }

                vkb::PhysicalDeviceSelector selector{_vkb_instance};
                vkb::PhysicalDevice physicalDevice = selector
                                                         .set_minimum_version(1, 1)
                                                         .set_surface(_surface)
                                                         .select()
                                                         .value();

                vkb::DeviceBuilder deviceBuilder{physicalDevice};
                _vkb_device = deviceBuilder.build().value();
                _dispatchTable = _vkb_device.make_table();

                vkb::SwapchainBuilder swapchainBuilder{physicalDevice.physical_device, _vkb_device.device, _surface};
                _vkb_swapchain = swapchainBuilder
                                     .use_default_format_selection()
                                     // use vsync present mode
                                     .set_desired_present_mode(VK_PRESENT_MODE_FIFO_KHR)
                                     .build()
                                     .value();

                _graphicsQueue = _vkb_device.get_queue(vkb::QueueType::graphics).value();
                auto graphicsQueueFamily = _vkb_device.get_queue_index(vkb::QueueType::graphics).value();

                VkCommandPoolCreateInfo commandPoolInfo = {};
                commandPoolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
                commandPoolInfo.pNext = nullptr;
                commandPoolInfo.queueFamilyIndex = graphicsQueueFamily;
                commandPoolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
                _dispatchTable.createCommandPool(&commandPoolInfo, nullptr, &_commandPool);

                VkCommandBufferAllocateInfo cmdAllocInfo = {};
                cmdAllocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
                cmdAllocInfo.pNext = nullptr;
                cmdAllocInfo.commandPool = _commandPool;
                cmdAllocInfo.commandBufferCount = 1;
                cmdAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
                VkCommandBuffer vk_commandBuffer = nullptr;
                _dispatchTable.allocateCommandBuffers(&cmdAllocInfo, &vk_commandBuffer);
                _commandBuffer = new CommandBuffer(_isolate);

                return false;
            }

            ~Impl()
            {
                _dispatchTable.destroyCommandPool(_commandPool, nullptr);
                vkb::destroy_swapchain(_vkb_swapchain);
                vkb::destroy_device(_vkb_device);
                vkb::destroy_surface(_vkb_instance.instance, _surface);
                vkb::destroy_instance(_vkb_instance);
            }
        };

        Device::Device(v8::Isolate *isolate, SDL_Window *window) : Binding(isolate), _impl(new Impl(isolate, window)) {}

        CommandBuffer *Device::commandBuffer()
        {
            return _impl->commandBuffer();
        }

        bool Device::initialize()
        {
            return _impl->initialize();
        }

        Device::~Device()
        {
            delete _impl;
        }
    }
}
