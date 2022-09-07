#include "bindings/gfx/device.hpp"
#include "VkContext.hpp"
#include "VkBootstrap.h"
#include "SDL_vulkan.h"
#include "VkCommandBufferImpl.hpp"
#include "VkBufferImpl.hpp"
#include "VkShaderImpl.hpp"
#include "VkPipelineImpl.hpp"

#define VMA_IMPLEMENTATION
#include "vma/vk_mem_alloc.h"

#include "glslang/Public/ShaderLang.h"

namespace binding
{
    namespace gfx
    {
        class Device::Impl
        {
        private:
            SDL_Window *_window = nullptr;
            vkb::Instance _vkb_instance;
            VkSurfaceKHR _surface = nullptr;
            vkb::Device _vkb_device;

            std::unique_ptr<Context> _context;

            vkb::Swapchain _vkb_swapchain;
            std::vector<VkImageView> _swapchainImageViews;

            VkQueue _graphicsQueue = nullptr;
            VkCommandPool _commandPool = nullptr;
            VkRenderPass _renderPass = nullptr;
            std::vector<VkFramebuffer> _framebuffers;

            VmaAllocator _allocator;

            CommandBuffer *_commandBuffer = nullptr;
            v8::Global<v8::Object> _js_commandBuffer;

        public:
            Impl(SDL_Window *window) : _window(window) {}

            CommandBuffer *commandBuffer() { return _commandBuffer; }

            bool initialize()
            {
                const uint32_t version = VK_MAKE_API_VERSION(0, 1, 1, 0);

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
                                    .require_api_version(version)
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

                _context = std::make_unique<Context>(version, _vkb_device.device);

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

                VkCommandBufferAllocateInfo cmdAllocInfo = {};
                cmdAllocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
                cmdAllocInfo.pNext = nullptr;
                cmdAllocInfo.commandPool = _commandPool;
                cmdAllocInfo.commandBufferCount = 1;
                cmdAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
                VkCommandBuffer vk_commandBuffer = nullptr;
                vkAllocateCommandBuffers(_vkb_device.device, &cmdAllocInfo, &vk_commandBuffer);
                _commandBuffer = new CommandBuffer(std::make_unique<CommandBufferImpl>(vk_commandBuffer));
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

                glslang::InitializeProcess();

                return false;
            }

            Buffer *createBuffer() { return new Buffer(std::make_unique<BufferImpl>(_vkb_device.device, _allocator)); }

            Shader *createShader() { return new Shader(std::make_unique<ShaderImpl>(_context.get())); }

            Pipeline *createPipeline() { return new Pipeline(std::make_unique<PipelineImpl>(_vkb_device.device)); }

            ~Impl()
            {
                glslang::FinalizeProcess();

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
        };

        Device::Device(SDL_Window *window) : Binding(), _impl(new Impl(window)) {}
        CommandBuffer *Device::commandBuffer() { return _impl->commandBuffer(); }
        bool Device::initialize() { return _impl->initialize(); }
        Buffer *Device::createBuffer() { return _impl->createBuffer(); }
        Shader *Device::createShader() { return _impl->createShader(); }
        Pipeline *Device::createPipeline() { return _impl->createPipeline(); }
        Device::~Device() { delete _impl; }
    }
}
